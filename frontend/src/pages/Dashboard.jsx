import { useEffect, useState } from 'react';
import useAuthStore from '../store/useAuthStore';
import useExpenseStore from '../store/useExpenseStore';

export default function Dashboard() {
    const { user, logout } = useAuthStore();
    const { expenses, fetchExpenses, addExpense, deleteExpense, isLoading } = useExpenseStore();

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category_id: '', // TODO: Fetch categories properly
        merchant_name: ''
    });

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.description) return;

        // Hack: Sending null category_id if empty for now, or handle in backend
        // Since we didn't implement Category API yet, let's keep it simple
        // Backend expects category_id to be UUID or null. 
        // Let's remove category_id if empty string to avoid UUID error
        const expenseData = { ...formData };
        if (!expenseData.category_id) delete expenseData.category_id;

        const success = await addExpense(expenseData);
        if (success) {
            setFormData({ description: '', amount: '', category_id: '', merchant_name: '' });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-gray-500">{user?.email}</span>
                            <button onClick={logout} className="text-sm font-medium text-red-600 hover:text-red-500">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 md:grid-cols-3">
                    {/* Add Expense Form */}
                    <div className="md:col-span-1">
                        <div className="rounded-lg bg-white p-6 shadow">
                            <h2 className="mb-4 text-lg font-medium text-gray-900">Add Expense</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Description</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Merchant</label>
                                    <input
                                        type="text"
                                        value={formData.merchant_name}
                                        onChange={(e) => setFormData({ ...formData, merchant_name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                                >
                                    Add Transaction
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Expense List */}
                    <div className="md:col-span-2">
                        <div className="rounded-lg bg-white shadow overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h2 className="text-lg font-medium text-gray-900">Recent Transactions</h2>
                            </div>
                            {isLoading ? (
                                <div className="p-6 text-center text-gray-500">Loading...</div>
                            ) : expenses.length === 0 ? (
                                <div className="p-6 text-center text-gray-500">No expenses yet.</div>
                            ) : (
                                <ul className="divide-y divide-gray-200">
                                    {expenses.map((expense) => (
                                        <li key={expense.id} className="flex justify-between px-6 py-4 hover:bg-gray-50">
                                            <div>
                                                <p className="font-medium text-gray-900">{expense.description}</p>
                                                <p className="text-sm text-gray-500">
                                                    {expense.merchant_name && `${expense.merchant_name} • `}
                                                    {new Date(expense.created_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="font-bold text-gray-900">
                                                    ${Number(expense.amount).toFixed(2)}
                                                </span>
                                                <button
                                                    onClick={() => deleteExpense(expense.id)}
                                                    className="text-gray-400 hover:text-red-600"
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
