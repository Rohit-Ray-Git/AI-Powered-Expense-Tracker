import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

// Register
router.post('/register', async (req: Request, res: Response) => {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Name, email and password required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
            [email, hashedPassword, name]
        );

        const user = result.rows[0];
        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ user, token });
    } catch (error: any) {
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ error: 'Email already exists' });
        }
        console.error(error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
        res.json({ user: { id: user.id, email: user.email, name: user.name }, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Me (Protected)
import { authenticateToken } from '../middleware/auth';

router.get('/me', authenticateToken, (req: any, res: Response) => {
    // Return the user from the token (which now has name) or fetch fresh
    res.json({ user: req.user });
});

export default router;
