import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@localhost:5432/expense_tracker'
});

import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';
import categoryRoutes from './routes/categories';
import budgetRoutes from './routes/budgets';

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/budgets', budgetRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
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
