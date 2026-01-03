import { useState, useRef, useEffect } from 'react';
import useExpenseStore from '../store/useExpenseStore';
import { motion, AnimatePresence } from 'framer-motion';

const ChatModule = () => {
    const { chatMessages, sendChatMessage, isChatLoading } = useExpenseStore();
    const [input, setInput] = useState('');
    const listRef = useRef(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [chatMessages, isChatLoading]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        sendChatMessage(input);
        setInput('');
    };

    return (
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden flex flex-col h-[500px]">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-2">
                <span className="text-xl">💬</span>
                <h3 className="font-bold">Chat with Advisor</h3>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                    <div className="text-center text-gray-500 mt-10">
                        <p>Ask me anything about your spending!</p>
                        <p className="text-xs mt-2">"How much did I spend on food?"</p>
                        <p className="text-xs">"Can I afford a new phone?"</p>
                    </div>
                )}

                {chatMessages.map((msg, idx) => (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`max-w-[80%] p-3 rounded-xl text-sm leading-relaxed ${msg.role === 'user'
                                ? 'bg-emerald-500/20 text-emerald-100 rounded-tr-none'
                                : 'bg-white/10 text-gray-200 rounded-tl-none'
                            }`}>
                            {msg.content}
                        </div>
                    </motion.div>
                ))}

                {isChatLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white/10 p-3 rounded-xl rounded-tl-none flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your question..."
                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button
                    type="submit"
                    disabled={isChatLoading || !input.trim()}
                    className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-all"
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatModule;
