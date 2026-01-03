const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function createBudgetsTable() {
    try {
        console.log('Creating budgets table...');

        await pool.query(`
            CREATE TABLE IF NOT EXISTS budgets (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID REFERENCES users(id) ON DELETE CASCADE,
                category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
                amount DECIMAL(10, 2) NOT NULL,
                period VARCHAR(20) DEFAULT 'MONTHLY',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, category_id, period)
            );
        `);

        console.log('✅ Budgets table created successfully');
    } catch (error) {
        console.error('❌ Error creating budgets table:', error);
    } finally {
        await pool.end();
    }
}

createBudgetsTable();
