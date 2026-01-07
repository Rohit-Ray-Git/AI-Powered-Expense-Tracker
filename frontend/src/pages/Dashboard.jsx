import { useEffect, useState, useMemo, useRef } from 'react';
import useAuthStore from '../store/useAuthStore';
import useExpenseStore from '../store/useExpenseStore';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isYesterday, addMonths, subMonths, isSameMonth, startOfMonth, endOfMonth } from 'date-fns';
import ExpensesPieChart from '../components/ExpensesPieChart';
import FinancialSummary from '../components/FinancialSummary';
import SpendingTrends from '../components/SpendingTrends';
import BudgetSection from '../components/BudgetSection';
import SpendingInsights from '../components/SpendingInsights';
import AdvisorTab from '../components/AdvisorTab';
import CategoryBreakdown from '../components/CategoryBreakdown';
import TransactionHistoryModal from '../components/TransactionHistoryModal';
import SavingsSection from '../components/SavingsSection';


const Dashboard = () => {
    const { user, logout } = useAuthStore();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const profileRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const {
        expenses,
        categories,
        isLoading,
        fetchExpenses,
        fetchCategories,
        addExpense,
        updateExpense,
        deleteExpense
    } = useExpenseStore();

    const [activeTab, setActiveTab] = useState('overview');
    const [editingId, setEditingId] = useState(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category_id: '',
        category_id: '',
        merchant_name: '',
        date: new Date().toISOString().slice(0, 16) // Default to current time for datetime-local
    });

    // Month View State
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentMonth(prev => subMonths(prev, 1));
        setSelectedDate(null);
    };
    const handleNextMonth = () => {
        setCurrentMonth(prev => addMonths(prev, 1));
        setSelectedDate(null);
    };

    // Analysis State
    const [selectedDate, setSelectedDate] = useState(null);

    // Filter expenses for the specific selected month or date
    const filteredExpenses = useMemo(() => {
        if (activeTab === 'analysis') {
            if (selectedDate) {
                return expenses.filter(expense => {
                    const expenseDate = format(new Date(expense.created_at), 'MMM d, yyyy');
                    return expenseDate === selectedDate;
                });
            }
            return expenses.filter(expense => isSameMonth(new Date(expense.created_at), currentMonth));
        }
        return expenses;
    }, [expenses, activeTab, currentMonth, selectedDate]);

    useEffect(() => {
        fetchExpenses();
        fetchCategories();
        useExpenseStore.getState().fetchBudgets();
    }, [fetchExpenses, fetchCategories]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        let success;
        if (editingId) {
            success = await updateExpense(editingId, payload);
        } else {
            success = await addExpense(payload);
        }

        if (success) {
            setFormData({
                description: '',
                amount: '',
                category_id: '',
                category_id: '',
                merchant_name: '',
                date: new Date().toISOString().slice(0, 16)
            });
            setEditingId(null);
        }
    };

    const handleEdit = (expense) => {
        setEditingId(expense.id);
        setActiveTab('overview');
        setFormData({
            description: expense.description,
            amount: expense.amount,
            category_id: expense.category_id || '',
            category_id: expense.category_id || '',
            merchant_name: expense.merchant_name || '',
            date: expense.created_at ? new Date(expense.created_at).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16)
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setFormData({
            description: '',
            amount: '',
            category_id: '',
            category_id: '',
            merchant_name: '',
            date: new Date().toISOString().slice(0, 16)
        });
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '⚡' },
        { id: 'analysis', label: 'Analysis', icon: '📊' },
        { id: 'budgets', label: 'Budgets', icon: '💰' },
        { id: 'savings', label: 'Savings', icon: '🎯' },
        { id: 'advisor', label: 'Advisor', icon: '🤖' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <main className="max-w-7xl mx-auto relative z-10">
                <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Branding Section */}
                    <div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
                            Artha-AI
                        </h1>
                        <p className="text-xs text-gray-400">Financial Wisdom</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Navigation Tabs */}
                        <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 backdrop-blur-md border border-white/10 overflow-x-auto max-w-[calc(100vw-100px)] md:max-w-none">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                        ? 'bg-emerald-500/20 text-emerald-400 shadow-sm'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Profile Section */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="hover:bg-white/5 p-1 rounded-full transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-lg ring-2 ring-white/10">
                                    {user?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-2 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 origin-top-right backdrop-blur-xl"
                                    >
                                        <div className="p-4 border-b border-white/5 bg-white/5">
                                            <p className="text-sm font-medium text-white">{user?.name}</p>
                                            <p className="text-xs text-gray-400">{user?.email}</p>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={logout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <span>🚪</span> Sign Out
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <div className="min-h-[600px]">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div
                                key="overview"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <FinancialSummary expenses={expenses} />

                                <div className="grid gap-6 md:grid-cols-3">
                                    <div className="md:col-span-1">
                                        <div className="glass-panel rounded-2xl p-6 sticky top-6">
                                            <h2 className="mb-6 text-lg font-medium text-emerald-400 flex items-center gap-2">
                                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                                {editingId ? 'Edit Transaction' : 'New Transaction'}
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
                                                        <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
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
                                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Category (Optional)</label>
                                                    <select
                                                        value={formData.category_id}
                                                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                                        className="input-field block w-full rounded-lg p-2.5 text-sm placeholder-gray-600 appearance-none bg-[#0a0a0a]"
                                                    >
                                                        <option value="" className="bg-[#0a0a0a] text-gray-300">Auto-Detect (AI)</option>
                                                        {categories.map((cat) => (
                                                            <option key={cat.id} value={cat.id} className="bg-[#0a0a0a] text-gray-300">
                                                                {cat.icon} {cat.name}
                                                            </option>
                                                        ))}
                                                    </select>
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
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Date & Time</label>
                                                    <input
                                                        type="datetime-local"
                                                        value={formData.date}
                                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                        className="input-field block w-full rounded-lg p-2.5 text-sm placeholder-gray-600 [color-scheme:dark]"
                                                        required
                                                    />
                                                </div>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="submit"
                                                    className="btn-primary w-full rounded-lg py-3 text-sm uppercase tracking-wide shadow-lg hover:shadow-emerald-500/20 mt-4"
                                                >
                                                    {editingId ? 'Update Transaction' : 'Add Transaction'}
                                                </motion.button>
                                                {editingId && (
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEdit}
                                                        className="w-full mt-3 text-sm text-gray-400 hover:text-white transition-colors"
                                                    >
                                                        Cancel Editing
                                                    </button>
                                                )}
                                            </form>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="glass-panel rounded-xl overflow-hidden min-h-[500px] flex flex-col">
                                            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                                <h2 className="text-lg font-medium text-emerald-400">Recent Activity</h2>
                                                <button
                                                    onClick={() => setIsHistoryOpen(true)}
                                                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium uppercase tracking-wider transition-colors"
                                                >
                                                    See All
                                                </button>
                                            </div>

                                            {isLoading ? (
                                                <div className="p-12 text-center text-gray-500 animate-pulse">Loading data...</div>
                                            ) : expenses.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-4 p-12">
                                                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                                                        <span className="text-2xl">💸</span>
                                                    </div>
                                                    <p>No transactions yet.</p>
                                                </div>
                                            ) : (
                                                <ul className="divide-y divide-white/5">
                                                    <AnimatePresence initial={false}>
                                                        {expenses.slice(0, 5).map((expense, index) => {
                                                            const date = new Date(expense.created_at);
                                                            let dateLabel = format(date, 'MMM d');
                                                            if (isToday(date)) dateLabel = 'Today';
                                                            else if (isYesterday(date)) dateLabel = 'Yesterday';

                                                            return (
                                                                <motion.li
                                                                    key={expense.id}
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: "auto" }}
                                                                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                                                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                                                    className="flex justify-between items-center px-6 py-4 hover:bg-white/5 transition-colors group"
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl border border-white/10">
                                                                            {expense.category_icon || '💲'}
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-medium text-gray-200 group-hover:text-white transition-colors">{expense.description}</p>
                                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{dateLabel}</span>
                                                                                <span className="text-gray-600 text-[10px]">•</span>
                                                                                <span className="text-xs text-gray-400">{expense.category_name}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-4">
                                                                        <span className="font-mono font-medium text-emerald-300">
                                                                            -₹{Number(expense.amount).toLocaleString()}
                                                                        </span>
                                                                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                                                            <button
                                                                                onClick={() => handleEdit(expense)}
                                                                                className="text-gray-500 hover:text-emerald-400 p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                                                                title="Edit"
                                                                            >
                                                                                ✎
                                                                            </button>
                                                                            <button
                                                                                onClick={() => deleteExpense(expense.id)}
                                                                                className="text-gray-500 hover:text-red-400 p-1.5 hover:bg-white/10 rounded-md transition-colors"
                                                                                title="Delete"
                                                                            >
                                                                                ✕
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.li>
                                                            )
                                                        })}
                                                    </AnimatePresence>
                                                </ul>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'analysis' && (
                            <motion.div
                                key="analysis"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                {/* Month Navigator Header */}
                                <div className="glass-panel p-4 rounded-xl flex items-center justify-between relative z-50">
                                    <h2 className="text-xl font-medium text-gray-200">Monthly Analysis</h2>

                                    <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-lg border border-white/5">
                                        <button
                                            onClick={handlePrevMonth}
                                            className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                        >
                                            ◀
                                        </button>
                                        <span className="font-mono text-lg font-bold text-emerald-400 min-w-[140px] text-center">
                                            {format(currentMonth, 'MMMM yyyy')}
                                        </span>
                                        <button
                                            onClick={handleNextMonth}
                                            className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors"
                                        >
                                            ▶
                                        </button>
                                    </div>
                                </div>

                                {selectedDate && (
                                    <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                                                📅
                                            </div>
                                            <div>
                                                <p className="text-gray-400 text-xs uppercase tracking-wider font-medium">Viewing Data For</p>
                                                <h3 className="text-emerald-400 font-bold text-lg">{selectedDate}</h3>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedDate(null)}
                                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <span>✕</span> Clear Filter
                                        </button>
                                    </div>
                                )}

                                <SpendingInsights expenses={filteredExpenses} />

                                <div className="mb-6">
                                    <SpendingTrends
                                        currentMonth={currentMonth}
                                        onDateSelect={setSelectedDate}
                                        selectedDate={selectedDate}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="glass-panel rounded-xl p-6 h-[400px]">
                                        <h3 className="text-emerald-400 font-medium mb-6 text-lg">Spending Distribution</h3>
                                        <div className="h-[300px]">
                                            <ExpensesPieChart expenses={filteredExpenses} />
                                        </div>
                                    </div>

                                    <div className="glass-panel rounded-xl p-6 h-[400px]">
                                        <h3 className="text-emerald-400 font-medium mb-6 text-lg">Top Spending Categories</h3>
                                        <div className="h-[300px]">
                                            <CategoryBreakdown expenses={filteredExpenses} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'budgets' && (
                            <motion.div
                                key="budgets"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <BudgetSection />
                            </motion.div>
                        )}

                        {activeTab === 'savings' && (
                            <motion.div
                                key="savings"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <SavingsSection />
                            </motion.div>
                        )}

                        {activeTab === 'advisor' && (
                            <motion.div
                                key="advisor"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AdvisorTab />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <TransactionHistoryModal
                isOpen={isHistoryOpen}
                onClose={() => setIsHistoryOpen(false)}
                expenses={expenses}
            />
        </div>
    );
}

export default Dashboard;
