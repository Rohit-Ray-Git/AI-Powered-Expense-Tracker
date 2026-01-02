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
            `SELECT e.*, c.name as category_name 
             FROM expenses e 
             LEFT JOIN categories c ON e.category_id = c.id 
             WHERE e.user_id = $1 
             ORDER BY e.created_at DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Add a new expense
import axios from 'axios';

router.post('/', authenticateToken, async (req: any, res: Response) => {
    let { amount, description, category_id, merchant_name, date } = req.body;

    if (!amount) {
        return res.status(400).json({ error: 'Amount is required' });
    }

    try {
        // AI Categorization if no category provided
        if (!category_id && merchant_name) {
            try {
                const mlResponse = await axios.post('http://localhost:8000/api/ml/categorize', {
                    merchant: merchant_name,
                    amount: parseFloat(amount)
                });
                const predictedCategory = mlResponse.data.category;

                // Find or Create Category
                let catResult = await pool.query(
                    'SELECT id FROM categories WHERE user_id = $1 AND name = $2',
                    [req.user.id, predictedCategory]
                );

                if (catResult.rows.length === 0) {
                    catResult = await pool.query(
                        'INSERT INTO categories (user_id, name) VALUES ($1, $2) RETURNING id',
                        [req.user.id, predictedCategory]
                    );
                }
                category_id = catResult.rows[0].id;
            } catch (mlError) {
                console.error('ML Service Error:', mlError);
                // Fallback to 'Miscellaneous' or leave null
            }
        }

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
