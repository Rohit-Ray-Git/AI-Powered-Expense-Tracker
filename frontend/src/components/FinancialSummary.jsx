import { useMemo } from 'react';
import HoloCard from './HoloCard';

export default function FinancialSummary({ expenses }) {
    const stats = useMemo(() => {
        const total = expenses.reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
        const count = expenses.length;
        const avg = count > 0 ? total / count : 0;

        // Find top category
        const catMap = {};
        expenses.forEach(e => {
            const cat = e.category_name || 'Uncategorized';
            catMap[cat] = (catMap[cat] || 0) + parseFloat(e.amount);
        });
        const topCategory = Object.entries(catMap).sort((a, b) => b[1] - a[1])[0];

        return { total, count, avg, topCategory };
    }, [expenses]);

    return (
        <div className="grid grid-cols-2 gap-4">
            <HoloCard variant="emerald" className="p-4 flex flex-col justify-center">
                <span className="text-emerald-100/60 text-xs uppercase tracking-wider mb-1">Total Spent</span>
                <span className="text-2xl font-bold text-white">₹{stats.total.toFixed(2)}</span>
            </HoloCard>

            <HoloCard variant="purple" className="p-4 flex flex-col justify-center">
                <span className="text-purple-100/60 text-xs uppercase tracking-wider mb-1">Transactions</span>
                <span className="text-2xl font-bold text-white">{stats.count}</span>
            </HoloCard>

            <HoloCard variant="blue" className="p-4 flex flex-col justify-center col-span-2">
                <div className="flex justify-between items-end">
                    <div>
                        <span className="text-blue-100/60 text-xs uppercase tracking-wider mb-1">Top Category</span>
                        <div className="text-lg font-medium text-white flex items-center gap-2">
                            {stats.topCategory ? (
                                <>
                                    <span>{stats.topCategory[0]}</span>
                                    <span className="text-blue-200 text-sm">(₹{stats.topCategory[1].toFixed(2)})</span>
                                </>
                            ) : (
                                <span>-</span>
                            )}
                        </div>
                    </div>
                </div>
            </HoloCard>
        </div>
    );
}
