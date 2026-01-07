import { create } from 'zustand';
import api from '../lib/axios';

const useExpenseStore = create((set, get) => ({
    expenses: [],
    categories: [],
    isLoading: false,
    error: null,

    fetchCategories: async () => {
        try {
            const res = await api.get('/categories');
            set({ categories: res.data });
        } catch (error) {
            console.error('Failed to fetch categories:', error);
        }
    },

    fetchExpenses: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get('/expenses');
            set({ expenses: res.data, isLoading: false, error: null });
        } catch (error) {
            set({ isLoading: false, error: 'Failed to fetch expenses' });
        }
    },

    addExpense: async (expenseData) => {
        try {
            const res = await api.post('/expenses', expenseData);
            set((state) => ({
                expenses: [res.data, ...state.expenses],
                error: null
            }));
            return true;
        } catch (error) {
            set({ error: 'Failed to add expense' });
            return false;
        }
    },

    updateExpense: async (id, expenseData) => {
        try {
            const res = await api.put(`/expenses/${id}`, expenseData);
            set((state) => ({
                expenses: state.expenses.map((e) => (e.id === id ? res.data : e)),
                error: null
            }));
            return true;
        } catch (error) {
            set({ error: 'Failed to update expense' });
            return false;
        }
    },

    deleteExpense: async (id) => {
        try {
            await api.delete(`/expenses/${id}`);
            set((state) => ({
                expenses: state.expenses.filter((e) => e.id !== id),
                error: null
            }));
        } catch (error) {
            set({ error: 'Failed to delete expense' });
        }
    },

    // Budgets
    budgets: [],
    fetchBudgets: async () => {
        try {
            const res = await api.get('/budgets');
            set({ budgets: res.data });
        } catch (error) {
            console.error('Failed to fetch budgets', error);
        }
    },

    addBudget: async (budgetData) => {
        try {
            const res = await api.post('/budgets', budgetData);
            set((state) => {
                // Remove existing budget for same category if exists (upsert logic in UI)
                const filtered = state.budgets.filter(b => b.category_id !== res.data.category_id);
                return { budgets: [...filtered, res.data] };
            });
            return true;
        } catch (error) {
            console.error('Failed to save budget', error);
            return false;
        }
    },

    // AI Advisor
    financialAdvice: [],
    isAdviceLoading: false,
    fetchFinancialAdvice: async () => {
        try {
            // Get current expenses from state
            const expenses = get().expenses;
            if (expenses.length === 0) return;

            set({ isAdviceLoading: true });

            const mlApiUrl = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
            const response = await fetch(`${mlApiUrl}/api/ml/audit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    expenses: expenses.map(e => ({
                        description: e.description,
                        amount: parseFloat(e.amount),
                        category: e.category_name || "Uncategorized",
                        date: e.created_at
                    }))
                })
            });

            if (response.ok) {
                const data = await response.json();
                set({ financialAdvice: data.insights, isAdviceLoading: false });
            } else {
                set({ isAdviceLoading: false });
            }
        } catch (error) {
            console.error('Failed to fetch advice:', error);
            set({ isAdviceLoading: false });
        }
    },

    // Chat
    chatMessages: [],
    isChatLoading: false,
    sendChatMessage: async (message) => {
        const { expenses, chatMessages } = get();

        // Optimistic Update
        const newMessages = [...chatMessages, { role: 'user', content: message }];
        set({ chatMessages: newMessages, isChatLoading: true });

        try {
            const mlApiUrl = import.meta.env.VITE_ML_API_URL || 'http://localhost:8000';
            const response = await fetch(`${mlApiUrl}/api/ml/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    context: expenses.slice(0, 100).map(e => ({
                        description: e.description,
                        amount: parseFloat(e.amount),
                        category: e.category_name || "Uncategorized",
                        date: e.created_at
                    }))
                })
            });

            if (response.ok) {
                const data = await response.json();
                set({
                    chatMessages: [...newMessages, { role: 'assistant', content: data.response }],
                    isChatLoading: false
                });
            } else {
                set({ isChatLoading: false });
            }
        } catch (error) {
            console.error('Chat failed:', error);
            set({
                chatMessages: [...newMessages, { role: 'assistant', content: "Sorry, I couldn't reach the server." }],
                isChatLoading: false
            });
        }
    },

    deleteBudget: async (id) => {
        try {
            await api.delete(`/budgets/${id}`);
            set((state) => ({
                budgets: state.budgets.filter((b) => b.id !== id)
            }));
        } catch (error) {
            console.error('Failed to delete budget', error);
        }
    }
}));

export default useExpenseStore;
