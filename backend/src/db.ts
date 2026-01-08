import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Enable SSL for cloud databases (when DATABASE_URL is set)
const useSSL = !!process.env.DATABASE_URL;

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@localhost:5432/expense_tracker',
    ssl: useSSL ? { rejectUnauthorized: false } : undefined
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

pool.query('SELECT NOW()')
    .then(res => console.log('✅ Database connected successfully:', res.rows[0]))
    .catch(err => console.error('❌ Database connection failed:', err));
