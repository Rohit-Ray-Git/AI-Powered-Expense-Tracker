import { useEffect } from 'react';
import useExpenseStore from '../store/useExpenseStore';
import { motion } from 'framer-motion';

const AdviceCard = ({ advice, index }) => {
    const colors = {
        warning: 'border-amber-500/20 bg-amber-500/10 text-amber-200',
        tip: 'border-blue-500/20 bg-blue-500/10 text-blue-200',
        kudos: 'border-pink-500/20 bg-pink-500/10 text-pink-200',
        saving: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200',
    };

    const icons = {
        warning: '⚠️',
        tip: '💡',
        kudos: '🎉',
        saving: '💰',
    };

    const style = colors[advice.type] || colors.tip;
    const icon = icons[advice.type] || icons.tip;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border ${style} backdrop-blur-md relative overflow-hidden`}
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-2xl">{icon}</span>
                {advice.potential_savings > 0 && (
                    <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded text-white">
                        Save ₹{advice.potential_savings}
                    </span>
                )}
            </div>
            <h3 className="font-bold mb-2 text-lg">{advice.title}</h3>
            <p className="text-sm opacity-90 leading-relaxed">{advice.message}</p>
        </motion.div>
    );
};

import ChatModule from './ChatModule';

const AdvisorTab = () => {
    const { fetchFinancialAdvice, financialAdvice, isAdviceLoading, expenses } = useExpenseStore();


    useEffect(() => {
        fetchFinancialAdvice();
    }, [expenses]); // Re-fetch if expenses change

    return (
        <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-3">
                    AI Financial Coach
                </h2>
                <p className="text-gray-400">
                    I analyze your spending patterns to find hidden opportunities for savings.
                </p>
            </div>

            {isAdviceLoading || financialAdvice.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 rounded-xl bg-white/5 animate-pulse border border-white/5 flex items-center justify-center">
                            {isAdviceLoading ? (
                                <div className="text-center">
                                    <span className="text-2xl animate-bounce inline-block mb-2">🤔</span>
                                    <p className="text-sm text-gray-400 animate-pulse">Analyzing spending habits...</p>
                                </div>
                            ) : (
                                <div className="text-center text-gray-500">
                                    <p>No advice ready yet.</p>
                                    <button
                                        onClick={() => fetchFinancialAdvice()}
                                        className="mt-2 text-xs text-emerald-400 hover:underline"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {financialAdvice.map((advice, index) => (
                        <AdviceCard key={index} advice={advice} index={index} />
                    ))}
                </div>
            )}

            <ChatModule />

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="text-center mt-12"
            >
                <p className="text-xs text-gray-500 uppercase tracking-widest">Powered by GPT-4o Mini</p>
            </motion.div>
        </div>
    );
};

export default AdvisorTab;
