import { create } from 'zustand';
import api from '../lib/axios';

const useSavingsStore = create((set, get) => ({
    goals: [],
    isLoading: false,
    error: null,

    fetchGoals: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/savings');
            set({ goals: response.data, isLoading: false, error: null });
        } catch (error) {
            set({ error: error.message, isLoading: false });
        }
    },

    addGoal: async (goalData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/savings', goalData);
            set(state => ({
                goals: [response.data, ...state.goals],
                isLoading: false
            }));
            return true;
        } catch (error) {
            set({ error: error.message, isLoading: false });
            return false;
        }
    },

    addFunds: async (id, amount) => {
        try {
            const response = await api.put(`/savings/${id}/add`, { amount });
            set(state => ({
                goals: state.goals.map(goal =>
                    goal.id === id ? response.data : goal
                )
            }));
            return true;
        } catch (error) {
            console.error('Error adding funds:', error);
            return false;
        }
    },

    deleteGoal: async (id) => {
        try {
            await api.delete(`/savings/${id}`);
            set(state => ({
                goals: state.goals.filter(goal => goal.id !== id)
            }));
            return true;
        } catch (error) {
            console.error('Error deleting goal:', error);
            return false;
        }
    }
}));

export default useSavingsStore;
