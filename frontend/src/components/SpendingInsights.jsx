import { motion } from 'framer-motion';

const SpendingInsights = ({ expenses }) => {
    if (!expenses || expenses.length === 0) return null;

    // 1. Calculate Total Spending
    const totalSpending = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

    // 2. Group by Category
    const categoryTotals = expenses.reduce((acc, item) => {
        const catName = item.category_name || 'Uncategorized';
        acc[catName] = (acc[catName] || 0) + Number(item.amount);
        return acc;
    }, {});

    // 3. Find Top Category
    let topCategory = null;
    let maxAmount = 0;

    for (const [cat, amount] of Object.entries(categoryTotals)) {
        if (amount > maxAmount) {
            maxAmount = amount;
            topCategory = cat;
        }
    }

    // 4. Calculate Percentage
    const percentage = totalSpending > 0
        ? Math.round((maxAmount / totalSpending) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel p-6 rounded-xl border border-emerald-500/20 bg-gradient-to-br from-[#0a0a0a] to-emerald-900/10 mb-6"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-full text-2xl">
                    💡
                </div>
                <div>
                    <h3 className="text-emerald-400 font-medium mb-2 text-lg">Spending Insight</h3>
                    <p className="text-gray-300 leading-relaxed text-lg">
                        You've spent a total of <span className="font-bold text-white">₹{totalSpending.toLocaleString()}</span>.
                        Most of your money goes to <span className="font-bold text-emerald-400">{topCategory}</span> (₹{maxAmount.toLocaleString()}),
                        which makes up <span className="font-bold text-white">{percentage}%</span> of your total expenses.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                        Try setting a budget for {topCategory} to save more next month!
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default SpendingInsights;
