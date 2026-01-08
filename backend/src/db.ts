import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://dev_user:dev_password@localhost:5432/expense_tracker',
    ssl: isProduction ? { rejectUnauthorized: false } : undefined
});

pool.on('error', (err) => {
    console.error('❌ Unexpected error on idle client', err);
});

pool.query('SELECT NOW()')
    .then(res => console.log('✅ Database connected successfully:', res.rows[0]))
    .catch(err => console.error('❌ Database connection failed:', err));
