import { useEffect, useState } from 'react';
import useSavingsStore from '../store/useSavingsStore';
import SavingsCard from './SavingsCard';
import AddGoalModal from './AddGoalModal';

const SavingsSection = () => {
    const { goals, isLoading, fetchGoals } = useSavingsStore();
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchGoals();
    }, [fetchGoals]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-bold text-white">Your Savings Goals</h2>
                    <p className="text-sm text-gray-400 mt-1">Track and manage your financial targets</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"
                >
                    <span>+</span> New Goal
                </button>
            </div>

            {isLoading && goals.length === 0 ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading goals...</p>
                </div>
            ) : goals.length === 0 ? (
                <div className="text-center py-20 glass-panel rounded-2xl border-dashed border-2 border-white/5">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                        🎯
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No goals yet</h3>
                    <p className="text-gray-400 mb-6">Create your first savings goal to start tracking.</p>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                        Create a Goal →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <SavingsCard key={goal.id} goal={goal} />
                    ))}
                </div>
            )}

            <AddGoalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
};

export default SavingsSection;
