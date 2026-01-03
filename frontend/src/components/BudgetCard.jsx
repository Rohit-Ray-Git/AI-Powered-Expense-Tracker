import { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function BudgetCard({ budget, expenses, onDelete }) {
    // Calculate spent amount for this category in the current month
    const spent = useMemo(() => {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        return expenses
            .filter(e => {
                const d = new Date(e.created_at);
                return e.category_id === budget.category_id &&
                    d.getMonth() === currentMonth &&
                    d.getFullYear() === currentYear;
            })
            .reduce((sum, e) => sum + parseFloat(e.amount), 0);
    }, [expenses, budget.category_id]);

    const percentage = Math.min((spent / budget.amount) * 100, 100);
    const isOverBudget = spent > budget.amount;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-4 rounded-xl relative group"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl">{budget.category_icon || '💰'}</span>
                    <div>
                        <h4 className="text-sm font-medium text-gray-200">{budget.category_name}</h4>
                        <p className="text-xs text-gray-500">Monthly Limit</p>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(budget.id)}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    ✕
                </button>
            </div>

            <div className="mb-2 flex justify-between items-end">
                <span className={`text-lg font-bold ${isOverBudget ? 'text-red-400' : 'text-emerald-400'}`}>
                    ₹{spent.toFixed(0)}
                </span>
                <span className="text-xs text-gray-500 mb-1">
                    of ₹{parseFloat(budget.amount).toFixed(0)}
                </span>
            </div>

            <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-emerald-500'}`}
                />
            </div>
        </motion.div>
    );
}
