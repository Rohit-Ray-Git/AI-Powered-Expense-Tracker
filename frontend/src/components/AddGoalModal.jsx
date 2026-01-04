import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import useSavingsStore from '../store/useSavingsStore';

const AddGoalModal = ({ isOpen, onClose }) => {
    const { addGoal } = useSavingsStore();
    const [formData, setFormData] = useState({
        name: '',
        target_amount: '',
        target_date: '',
        color: '#10B981',
        icon: '🎯'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await addGoal({
            ...formData,
            target_amount: parseFloat(formData.target_amount)
        });

        if (success) {
            setFormData({
                name: '',
                target_amount: '',
                target_date: '',
                color: '#10B981',
                icon: '🎯'
            });
            onClose();
        }
    };

    const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];
    const icons = ['🎯', '✈️', '🚗', '🏠', '💻', '🎁', '🎓', '💍'];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
                    >
                        <div className="glass-panel p-6 rounded-2xl shadow-2xl border border-white/10 m-4">
                            <h2 className="text-xl font-bold text-white mb-6">New Savings Goal</h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Goal Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field block w-full rounded-lg p-3 text-sm"
                                        placeholder="e.g. New Laptop"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Target Amount (₹)</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.target_amount}
                                        onChange={(e) => setFormData({ ...formData, target_amount: e.target.value })}
                                        className="input-field block w-full rounded-lg p-3 text-sm font-mono"
                                        placeholder="50000"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Target Date (Optional)</label>
                                    <input
                                        type="date"
                                        value={formData.target_date}
                                        onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                                        className="input-field block w-full rounded-lg p-3 text-sm text-white [color-scheme:dark]"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Color</label>
                                        <div className="flex flex-wrap gap-2">
                                            {colors.map(color => (
                                                <button
                                                    key={color}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, color })}
                                                    className={`w-6 h-6 rounded-full transition-transform hover:scale-110 ${formData.color === color ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : ''}`}
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Icon</label>
                                        <div className="flex flex-wrap gap-2">
                                            {icons.map(icon => (
                                                <button
                                                    key={icon}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, icon })}
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg hover:bg-white/10 transition-colors ${formData.icon === icon ? 'bg-white/10 ring-1 ring-white/20' : ''}`}
                                                >
                                                    {icon}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02]"
                                    >
                                        Create Goal
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AddGoalModal;
