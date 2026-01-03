import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import { motion } from 'framer-motion';
import HoloCard from '../components/HoloCard';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError('Invalid credentials');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 relative overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-md"
            >
                <HoloCard variant="purple" className="p-8">
                    <div className="mb-8 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-emerald-400 bg-clip-text text-transparent mb-2"
                        >
                            Welcome Back
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-gray-400"
                        >
                            Sign in to track your expenses
                        </motion.p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400 text-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-xs font-medium text-purple-200/60 uppercase tracking-wider mb-2">Email</label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field block w-full rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500/50 placeholder-gray-600 bg-black/20"
                                placeholder="you@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-purple-200/60 uppercase tracking-wider mb-2">Password</label>
                            <motion.input
                                whileFocus={{ scale: 1.01 }}
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field block w-full rounded-lg p-3 text-sm focus:ring-2 focus:ring-purple-500/50 placeholder-gray-600 bg-black/20"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(139, 92, 246, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="btn-primary w-full rounded-lg py-3 text-sm uppercase tracking-wide shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 border-none"
                        >
                            Sign In
                        </motion.button>
                    </form>

                    <p className="mt-8 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                            Register now
                        </Link>
                    </p>
                </HoloCard>
            </motion.div>
        </div>
    );
}
