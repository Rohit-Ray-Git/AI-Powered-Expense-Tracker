import { Router, Response } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();
// Pool imported from ../db

// Get all available categories (Global + User specific)
router.get('/', authenticateToken, async (req: any, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT * FROM categories 
             WHERE user_id IS NULL OR user_id = $1
             ORDER BY name ASC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export default router;
