import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import { Pool } from 'pg'; // Removed unused import

dotenv.config();

const app = express();

// Dynamic CORS configuration to allow all Vercel deployments
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow all Vercel deployments
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        // Allow explicitly listed origins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        console.log('❌ CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

import { pool } from './db';

import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';
import categoryRoutes from './routes/categories';
import budgetRoutes from './routes/budgets';
import savingsRouter from './routes/savings';

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings', savingsRouter);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.get('/', (req, res) => {
    res.send('API is running successfully');
});

// Basic Expense Routes
app.get('/api/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses LIMIT 100');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on :${PORT}`));
// Force restart
