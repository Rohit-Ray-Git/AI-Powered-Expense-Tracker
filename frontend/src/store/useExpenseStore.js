import { create } from 'zustand';
import api from '../lib/axios';

const useExpenseStore = create((set, get) => ({
    expenses: [],
    isLoading: false,
    error: null,

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
}));

export default useExpenseStore;
