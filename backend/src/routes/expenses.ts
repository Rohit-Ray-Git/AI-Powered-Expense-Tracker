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
            `SELECT e.*, c.name as category_name, c.icon as category_icon
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

// Get spending trends
router.get('/trends', authenticateToken, async (req: any, res: Response) => {
    const { timeframe, endDate, startDate } = req.query;

    let truncateUnit;
    switch (timeframe) {
        case 'weekly': truncateUnit = 'week'; break;
        case 'monthly': truncateUnit = 'month'; break;
        case 'daily': default: truncateUnit = 'day'; break;
    }

    try {
        const queryParams: any[] = [truncateUnit, req.user.id];
        let dateCondition = '';
        let orderByClause = 'ORDER BY period DESC'; // Default latest
        let limitClause = 'LIMIT 30';
        let shouldReverse = true; // Default reverse for latest

        if (startDate && endDate) {
            queryParams.push(startDate, endDate);
            dateCondition = 'AND created_at >= $3 AND created_at <= $4';
            orderByClause = 'ORDER BY period ASC'; // Chronological
            limitClause = ''; // No limit
            shouldReverse = false; // Already chronological
        } else if (endDate) {
            queryParams.push(endDate);
            dateCondition = 'AND created_at <= $3';
        }

        const result = await pool.query(
            `SELECT 
                DATE_TRUNC($1, created_at) as period, 
                SUM(amount) as total_amount
             FROM expenses 
             WHERE user_id = $2 ${dateCondition}
             GROUP BY period 
             ${orderByClause}
             ${limitClause}`,
            queryParams
        );

        if (shouldReverse) {
            const final = result.rows.reverse();
            console.log('Trends Response:', JSON.stringify(final));
            res.json(final);
        } else {
            console.log('Trends Response:', JSON.stringify(result.rows));
            res.json(result.rows);
        }
    } catch (error) {
        console.error('Trend Error:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
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
        const textToCategorize = merchant_name || description;
        if (!category_id && textToCategorize) {
            try {
                const mlResponse = await axios.post('http://localhost:8000/api/ml/categorize', {
                    merchant: textToCategorize,
                    amount: parseFloat(amount)
                });
                const predictedCategory = mlResponse.data.category;

                // Find Category (Global or User specific)
                let catResult = await pool.query(
                    'SELECT id FROM categories WHERE (user_id = $1 OR user_id IS NULL) AND name = $2',
                    [req.user.id, predictedCategory]
                );

                if (catResult.rows.length === 0) {
                    // Create new user-specific category if not found
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

        // ... rest of insert logic uses category_id


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

// Update an expense
router.put('/:id', authenticateToken, async (req: any, res: Response) => {
    const { id } = req.params;
    const { amount, description, category_id, merchant_name, date } = req.body;

    try {
        const result = await pool.query(
            `UPDATE expenses 
             SET amount = $1, description = $2, category_id = $3, merchant_name = $4, created_at = COALESCE($5, created_at)
             WHERE id = $6 AND user_id = $7
             RETURNING *, (SELECT name FROM categories WHERE id = $3) as category_name, (SELECT icon FROM categories WHERE id = $3) as category_icon`,
            [amount, description, category_id, merchant_name, date, id, req.user.id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update expense' });
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
