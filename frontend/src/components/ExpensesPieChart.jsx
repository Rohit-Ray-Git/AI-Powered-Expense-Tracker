import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

export default function ExpensesPieChart({ expenses }) {
    const data = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];

        const categoryMap = {};

        expenses.forEach((expense) => {
            const category = expense.category_name || 'Uncategorized';
            const amount = parseFloat(expense.amount);
            if (categoryMap[category]) {
                categoryMap[category] += amount;
            } else {
                categoryMap[category] = amount;
            }
        });

        return Object.keys(categoryMap).map((key) => ({
            name: key,
            value: categoryMap[key],
        })).sort((a, b) => b.value - a.value); // Sort by highest spending
    }, [expenses]);

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No data to display
            </div>
        );
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel p-3 rounded-lg border border-white/10 shadow-xl">
                    <p className="text-emerald-400 font-medium">{payload[0].name}</p>
                    <p className="text-white text-sm">
                        ₹{payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-gray-400 text-xs">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
