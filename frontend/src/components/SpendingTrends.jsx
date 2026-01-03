import { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import api from '../lib/axios';

const SpendingTrends = ({ currentMonth }) => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTrends = async () => {
            setIsLoading(true);
            try {
                const startDate = startOfMonth(currentMonth).toISOString();
                const endDate = endOfMonth(currentMonth).toISOString();

                const response = await api.get('/expenses/trends', {
                    params: {
                        startDate,
                        endDate,
                        timeframe: 'daily'
                    }
                });
                setData(response.data);
            } catch (error) {
                console.error('Failed to fetch trends', error);
                setData([]);
            } finally {
                setIsLoading(false);
            }
        };

        if (currentMonth) {
            fetchTrends();
        }
    }, [currentMonth]);

    const chartData = useMemo(() => {
        if (!currentMonth) return [];

        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);
        const daysInMonth = eachDayOfInterval({ start, end });

        // Create a map of existing data
        const dataMap = {};
        data.forEach(item => {
            const dateStr = format(parseISO(item.period), 'yyyy-MM-dd');
            dataMap[dateStr] = Number(item.total_amount);
        });

        // Fill in all days
        return daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            return {
                name: format(day, 'd'),
                fullDate: format(day, 'MMM d, yyyy'),
                amount: dataMap[dateStr] || 0
            };
        });
    }, [data, currentMonth]);

    return (
        <div className="glass-panel p-6 rounded-xl">
            <h3 className="text-emerald-400 font-medium mb-6 text-lg">Daily Spending Trends</h3>

            <div className="h-[300px] w-full">
                {isLoading ? (
                    <div className="h-full flex items-center justify-center text-gray-500">
                        Loading trends...
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#6b7280"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                interval={2}
                            />
                            <YAxis
                                stroke="#6b7280"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value}`}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                }}
                                formatter={(value) => [`₹${value}`, 'Spent']}
                                labelFormatter={(label, payload) => {
                                    if (payload && payload.length > 0) {
                                        return payload[0].payload.fullDate;
                                    }
                                    return label;
                                }}
                            />
                            <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.amount > 0 ? '#10b981' : '#374151'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
};

export default SpendingTrends;
