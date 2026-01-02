import { Router, Response } from 'express';
import { Pool } from 'pg';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Get all expenses for the user
router.get('/', authenticateToken, async (req: any, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM expenses WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Add a new expense
router.post('/', authenticateToken, async (req: any, res: Response) => {
    const { amount, description, category_id, merchant_name, date } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO expenses (user_id, amount, description, category_id, merchant_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [req.user.id, amount, description, category_id, merchant_name, date || new Date()]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to add expense' });
    }
});

// Delete an expense
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

export default router;
