import { motion } from 'framer-motion';
import { useState } from 'react';
import useSavingsStore from '../store/useSavingsStore';
import { format } from 'date-fns';

const SavingsCard = ({ goal }) => {
    const { addFunds, deleteGoal } = useSavingsStore();
    const [isAdding, setIsAdding] = useState(false);
    const [amount, setAmount] = useState('');

    const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const remaining = goal.target_amount - goal.current_amount;

    const handleAddFunds = async (e) => {
        e.preventDefault();
        if (!amount) return;

        const success = await addFunds(goal.id, parseFloat(amount));
        if (success) {
            setIsAdding(false);
            setAmount('');
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 rounded-2xl relative group overflow-hidden"
        >
            <div
                className="absolute top-0 left-0 w-1 h-full opacity-50"
                style={{ backgroundColor: goal.color }}
            />

            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl border border-white/10">
                        {goal.icon}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg text-white">{goal.name}</h3>
                        {goal.target_date && (
                            <p className="text-xs text-gray-400">
                                Target: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                            </p>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1.5"
                >
                    ✕
                </button>
            </div>

            <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="font-medium text-emerald-400">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: goal.color }}
                    />
                </div>
            </div>

            <div className="flex justify-between items-end mb-4">
                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Saved</p>
                    <p className="text-xl font-bold text-white">₹{Number(goal.current_amount).toLocaleString()}</p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Target</p>
                    <p className="text-sm font-medium text-gray-300">₹{Number(goal.target_amount).toLocaleString()}</p>
                </div>
            </div>

            {isAdding ? (
                <form onSubmit={handleAddFunds} className="flex gap-2">
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className="input-field flex-1 text-sm py-2"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                        ✓
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsAdding(false)}
                        className="text-gray-400 hover:text-white px-2"
                    >
                        ✕
                    </button>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-200 transition-colors border border-white/5 hover:border-white/10 flex items-center justify-center gap-2"
                >
                    <span>💰</span> Add Funds
                </button>
            )}
        </motion.div>
    );
};

export default SavingsCard;
