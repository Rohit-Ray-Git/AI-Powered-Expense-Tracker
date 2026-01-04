import { Router, Response } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /budgets - Get all budgets for the user
router.get('/', authenticateToken, async (req: any, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT b.*, c.name as category_name, c.icon as category_icon, c.color as category_color 
             FROM budgets b
             JOIN categories c ON b.category_id = c.id
             WHERE b.user_id = $1`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching budgets:', error);
        res.status(500).json({ error: 'Failed to fetch budgets' });
    }
});

// POST /budgets - Create or Update a budget (Upsert)
router.post('/', authenticateToken, async (req: any, res: Response) => {
    const { category_id, amount, period = 'MONTHLY' } = req.body;

    if (!category_id || !amount) {
        return res.status(400).json({ error: 'Category ID and Amount are required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO budgets (user_id, category_id, amount, period, updated_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, category_id, period) 
             DO UPDATE SET amount = EXCLUDED.amount, updated_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [req.user.id, category_id, amount, period]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error saving budget:', error);
        res.status(500).json({ error: 'Failed to save budget' });
    }
});

// DELETE /budgets/:id - Delete a budget
router.delete('/:id', authenticateToken, async (req: any, res: Response) => {
    try {
        await pool.query(
            'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.sendStatus(204);
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ error: 'Failed to delete budget' });
    }
});

export default router;
