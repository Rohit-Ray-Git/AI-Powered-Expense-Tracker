import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useExpenseStore from '../store/useExpenseStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const { expenses, fetchExpenses, addExpense, deleteExpense, isLoading } = useExpenseStore();

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category_id: '',
        merchant_name: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description) return;

        const expenseData = { ...formData };
        if (!expenseData.category_id) delete expenseData.category_id;

        const success = await addExpense(expenseData);
        if (success) {
            setFormData({ description: '', amount: '', category_id: '', merchant_name: '' });
        }
    };

    return (
        <div className="min-h-screen">
            {/* Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="glass-panel border-b-0 sticky top-0 z-50"
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <span className="text-white font-bold text-lg">E</span>
                            </div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Expense Tracker</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-400 text-sm">{user?.email}</span>
                            <button onClick={logout} className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Add Expense Form */}
                    <div className="md:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="glass-panel rounded-2xl p-6"
                        >
                            <h2 className="mb-6 text-lg font-medium text-emerald-400 flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                New Transaction
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field block w-full rounded-lg p-2.5 text-sm placeholder-gray-600"
                                        placeholder="e.g. Coffee"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Amount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            className="input-field block w-full rounded-lg p-2.5 pl-8 text-sm placeholder-gray-600 font-mono"
                                            placeholder="0.00"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Merchant</label>
                                    <input
                                        type="text"
                                        value={formData.merchant_name}
                                        onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                                        className="input-field block w-full rounded-lg p-2.5 text-sm placeholder-gray-600"
                                        placeholder="Optional"
                                    />
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.95 }}
                                    type="submit"
                                    className="btn-primary w-full rounded-lg py-3 text-sm uppercase tracking-wide shadow-lg hover:shadow-emerald-500/20 mt-4"
                                >
                                    Add Transaction
                                </motion.button>
                            </form>
                        </motion.div>
                    </div>

                    {/* Expense List */}
                    <div className="md:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5 }}
                            className="glass-panel rounded-xl overflow-hidden min-h-[500px]"
                        >
                            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h2 className="text-lg font-medium text-emerald-400">Recent Transactions</h2>
                                <span className="text-xs text-gray-500 uppercase tracking-wider">{expenses.length} Records</span>
                            </div>

                            {isLoading ? (
                                <div className="p-12 text-center text-gray-500 animate-pulse">Loading data...</div>
                            ) : expenses.length === 0 ? (
                                <div className="p-12 text-center text-gray-500 flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                        <span className="text-2xl">💸</span>
                                    </div>
                                    <p>No transactions yet.</p>
                                </div>
                            ) : (
                                <ul className="divide-y divide-white/5">
                                    <AnimatePresence initial={false}>
                                        {expenses.map((expense, index) => (
                                            <motion.li
                                                key={expense.id}
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                                className="flex justify-between items-center px-6 py-4 hover:bg-white/5 transition-colors group"
                                            >
                                                <div className="flex items-start gap-4 trans">
                                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                        💲
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-200 group-hover:text-white transition-colors">{expense.description}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            {expense.category_name && (
                                                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
                                                                    {expense.category_name}
                                                                </span>
                                                            )}
                                                            <span className="text-xs text-gray-500">
                                                                {expense.merchant_name ? `${expense.merchant_name} • ` : ''}
                                                                {new Date(expense.created_at).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="font-mono font-medium text-emerald-300 text-lg">
                                                        -${Number(expense.amount).toFixed(2)}
                                                    </span>
                                                    <button
                                                        onClick={() => deleteExpense(expense.id)}
                                                        className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 rounded-md"
                                                        title="Delete"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </motion.li>
                                        ))}
                                    </AnimatePresence>
                                </ul>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
