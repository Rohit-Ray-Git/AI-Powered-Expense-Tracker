import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Get all savings goals for the user
router.get('/', authenticateToken, async (req, res) => {
    try {
        // @ts-ignore
        const result = await pool.query(
            'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY created_at DESC',
            // @ts-ignore
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching savings goals:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create a new savings goal
router.post('/', authenticateToken, async (req, res) => {
    const { name, target_amount, target_date, color, icon } = req.body;

    try {
        const targetDate = target_date || null;
        const targetAmount = parseFloat(target_amount);

        if (isNaN(targetAmount)) {
            return res.status(400).json({ error: 'Invalid target amount' });
        }

        const result = await pool.query(
            `INSERT INTO savings_goals (user_id, name, target_amount, current_amount, target_date, color, icon)
             VALUES ($1, $2, $3, 0, $4, $5, $6)
             RETURNING *`,
            // @ts-ignore
            [req.user.id, name, targetAmount, targetDate, color || '#10B981', icon || '🎯']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating savings goal:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add funds to a goal (Update current_amount)
router.put('/:id/add', authenticateToken, async (req, res) => {
    const { amount } = req.body;
    const { id } = req.params;

    try {
        const result = await pool.query(
            `UPDATE savings_goals 
             SET current_amount = current_amount + $1 
             WHERE id = $2 AND user_id = $3 
             RETURNING *`,
            // @ts-ignore
            [amount, id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error updating savings goal:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete a goal
router.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM savings_goals WHERE id = $1 AND user_id = $2 RETURNING id',
            // @ts-ignore
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Error deleting savings goal:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
