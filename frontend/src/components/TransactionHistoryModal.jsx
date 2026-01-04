import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday } from 'date-fns';

const TransactionHistoryModal = ({ isOpen, onClose, expenses }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = useMemo(() => {
        const cats = new Set(expenses.map(e => e.category_name || 'Uncategorized'));
        return ['All', ...Array.from(cats)];
    }, [expenses]);

    const filteredExpenses = useMemo(() => {
        return expenses.filter(expense => {
            const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (expense.merchant_name && expense.merchant_name.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesCategory = selectedCategory === 'All' || (expense.category_name || 'Uncategorized') === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [expenses, searchTerm, selectedCategory]);

    const groupedExpenses = useMemo(() => {
        const groups = {};
        filteredExpenses.forEach(expense => {
            const date = new Date(expense.created_at);
            let key = format(date, 'yyyy-MM-dd');
            if (isToday(date)) key = 'Today';
            else if (isYesterday(date)) key = 'Yesterday';
            else key = format(date, 'MMM d, yyyy');

            if (!groups[key]) groups[key] = [];
            groups[key].push(expense);
        });
        return groups;
    }, [filteredExpenses]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="bg-[#121212] w-full max-w-2xl max-h-[85vh] rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a]">
                        <div>
                            <h2 className="text-xl font-bold text-white">Transaction History</h2>
                            <p className="text-sm text-gray-400">{filteredExpenses.length} transactions found</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="p-4 border-b border-white/5 bg-[#121212] space-y-3">
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        />
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {categories.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${selectedCategory === cat
                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                        {Object.entries(groupedExpenses).length === 0 ? (
                            <div className="text-center py-20 text-gray-500">
                                No transactions match your search.
                            </div>
                        ) : (
                            Object.entries(groupedExpenses).map(([dateLabel, txns]) => (
                                <div key={dateLabel}>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-[#121212] py-2 z-10">
                                        {dateLabel}
                                    </h3>
                                    <div className="space-y-2">
                                        {txns.map(expense => (
                                            <div key={expense.id} className="flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">
                                                        {expense.category_icon || '💲'}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-200">{expense.description}</p>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                                            <span>{expense.category_name}</span>
                                                            {expense.merchant_name && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>{expense.merchant_name}</span>
                                                                </>
                                                            )}
                                                            <span className="md:hidden">• {format(new Date(expense.created_at), 'h:mm a')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono font-medium text-emerald-400">
                                                        -₹{Number(expense.amount).toLocaleString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500 hidden md:block">
                                                        {format(new Date(expense.created_at), 'h:mm a')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TransactionHistoryModal;
