import { useState } from 'react';
import { motion } from 'framer-motion';
import useExpenseStore from '../store/useExpenseStore';
import BudgetCard from './BudgetCard';

export default function BudgetSection() {
    const { budgets, expenses, categories, addBudget, deleteBudget } = useExpenseStore();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({ category_id: '', amount: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.category_id || !formData.amount) return;

        const success = await addBudget(formData);
        if (success) {
            setFormData({ category_id: '', amount: '' });
            setIsAdding(false);
        }
    };

    return (
        <div className="glass-panel rounded-xl p-6 h-full">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-emerald-400 font-medium text-lg">Monthly Budgets</h3>
                    <p className="text-gray-400 text-sm">Set limits for categories.</p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="text-xs bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg hover:bg-emerald-500/20 transition-colors border border-emerald-500/20"
                >
                    {isAdding ? 'Cancel' : '+ Set Limit'}
                </button>
            </div>

            {isAdding && (
                <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 space-y-3 bg-white/5 p-4 rounded-lg border border-white/10"
                    onSubmit={handleSubmit}
                >
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Category</label>
                        <select
                            value={formData.category_id}
                            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                            className="input-field block w-full rounded-lg p-2 text-sm bg-[#0a0a0a]"
                            required
                        >
                            <option value="" className="bg-[#0a0a0a]">Select Category</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id} className="bg-[#0a0a0a]">{c.icon} {c.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1">Limit Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500 text-xs">₹</span>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="input-field block w-full rounded-lg p-2 pl-6 text-sm"
                                placeholder="5000"
                                required
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn-primary w-full py-2 rounded-lg text-xs mt-2">
                        Save Limit
                    </button>
                </motion.form>
            )}

            <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {budgets.length === 0 && !isAdding ? (
                    <p className="text-center text-gray-500 text-sm py-4">No budgets set yet.</p>
                ) : (
                    budgets.map(budget => (
                        <BudgetCard
                            key={budget.id}
                            budget={budget}
                            expenses={expenses}
                            onDelete={deleteBudget}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
