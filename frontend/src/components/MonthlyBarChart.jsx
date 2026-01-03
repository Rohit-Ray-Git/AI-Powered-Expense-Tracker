import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function MonthlyBarChart({ expenses }) {
    const data = useMemo(() => {
        if (!expenses || expenses.length === 0) return [];

        // Group by month (YYYY-MM)
        const groups = {};
        expenses.forEach(e => {
            const date = new Date(e.created_at);
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); // Grouping by Day for now for better visibility with few data points
            // For real monthly: 
            // const key = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            groups[key] = (groups[key] || 0) + parseFloat(e.amount);
        });

        // Convert to array and sort by date
        // Note: Simple sort by string for now, could be improved for proper date sorting
        return Object.keys(groups).map(key => ({
            name: key,
            amount: groups[key]
        }));
    }, [expenses]);

    if (data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-500">
                No data to display
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="glass-panel p-3 rounded-lg border border-white/10 shadow-xl">
                    <p className="text-gray-400 font-medium text-xs mb-1">{label}</p>
                    <p className="text-emerald-400 font-bold text-lg">
                        ₹{payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        hide={false}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(val) => `₹${val}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Bar
                        dataKey="amount"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={60}
                        fill="url(#colorBar)"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
