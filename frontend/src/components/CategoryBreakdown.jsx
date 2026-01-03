import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CategoryBreakdown = ({ expenses }) => {
    const categoriesData = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];

        const totalSpent = expenses.reduce((acc, curr) => acc + Number(curr.amount), 0);
        const catMap = {};

        expenses.forEach(exp => {
            const catName = exp.category_name || 'Uncategorized';
            if (!catMap[catName]) {
                catMap[catName] = {
                    name: catName,
                    amount: 0,
                    icon: exp.category_icon || '📁',
                    color: exp.category_color || '#10B981',
                    count: 0
                };
            }
            catMap[catName].amount += Number(exp.amount);
            catMap[catName].count += 1;
        });

        return Object.values(catMap)
            .map(cat => ({
                ...cat,
                percentage: ((cat.amount / totalSpent) * 100).toFixed(1)
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // Top 5
    }, [expenses]);

    if (categoriesData.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <p>No data available</p>
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-4">
                {categoriesData.map((cat, index) => (
                    <motion.div
                        key={cat.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                    >
                        <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                                <span className="text-xl">{cat.icon}</span>
                                <span className="text-sm font-medium text-gray-300">{cat.name}</span>
                                <span className="text-xs text-gray-500">({cat.count} txns)</span>
                            </div>
                            <div className="text-right">
                                <span className="text-sm font-bold text-gray-200">₹{cat.amount.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${cat.percentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className="h-full rounded-full"
                                style={{ backgroundColor: cat.color || '#10B981', opacity: 0.8 }}
                            />
                        </div>
                        <div className="text-right mt-0.5">
                            <span className="text-[10px] text-gray-500">{cat.percentage}% of total</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdown;
