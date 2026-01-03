import React, { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';

// Custom toggle button component
const DateButton = forwardRef(({ value, onClick }, ref) => (
    <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="glass-panel px-4 py-2 rounded-lg flex items-center gap-3 border border-white/10 hover:border-emerald-500/50 transition-colors group cursor-pointer"
        onClick={onClick}
        ref={ref}
    >
        <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
            📅
        </div>
        <div className="text-left">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Selected Date</p>
            <p className="text-sm font-medium text-white">{value || "Select Date"}</p>
        </div>
    </motion.button>
));

export default function CustomDatePicker({ selectedDate, onChange }) {
    return (
        <div className="relative z-50">
            <style>{`
                .react-datepicker {
                    background-color: #0a0a0a !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 12px !important;
                    font-family: inherit !important;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4) !important;
                    backdrop-filter: blur(20px);
                }
                .react-datepicker__header {
                    background-color: rgba(255, 255, 255, 0.05) !important;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
                    border-top-left-radius: 12px !important;
                    border-top-right-radius: 12px !important;
                    padding-top: 15px !important;
                }
                .react-datepicker__current-month {
                    color: white !important;
                    font-weight: 600 !important;
                    margin-bottom: 10px !important;
                }
                .react-datepicker__day-name {
                    color: #9ca3af !important;
                    width: 36px !important;
                    line-height: 36px !important;
                }
                .react-datepicker__day {
                    color: white !important;
                    width: 36px !important;
                    line-height: 36px !important;
                    border-radius: 8px !important;
                    margin: 2px !important;
                }
                .react-datepicker__day:hover {
                    background-color: rgba(16, 185, 129, 0.2) !important;
                }
                .react-datepicker__day--selected {
                    background-color: #10b981 !important;
                    color: white !important;
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.4);
                }
                .react-datepicker__day--keyboard-selected {
                    background-color: rgba(16, 185, 129, 0.2) !important;
                }
                .react-datepicker__triangle {
                    display: none !important;
                }
                .react-datepicker__navigation-icon::before {
                    border-color: #9ca3af !important;
                    border-width: 2px 2px 0 0 !important;
                }
                .react-datepicker__year-read-view--down-arrow,
                .react-datepicker__month-read-view--down-arrow,
                .react-datepicker__month-year-read-view--down-arrow {
                     border-color: #9ca3af !important;
                }
            `}</style>
            <DatePicker
                selected={selectedDate}
                onChange={onChange}
                customInput={<DateButton />}
                dateFormat="MMM d, yyyy"
                maxDate={new Date()}
                showPopperArrow={false}
                popperModifiers={[
                    {
                        name: "offset",
                        options: {
                            offset: [0, 10],
                        },
                    },
                ]}
            />
        </div>
    );
}
