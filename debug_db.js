const { Pool } = require('pg');
require('dotenv').config({ path: 'backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkData() {
    try {
        console.log('Connecting to:', process.env.DATABASE_URL);

        // Check latest expenses
        const res = await pool.query('SELECT created_at, amount FROM expenses ORDER BY created_at DESC LIMIT 5');
        console.log('Latest 5 Expenses:');
        console.table(res.rows);

        // Check oldest expenses
        const resOld = await pool.query('SELECT created_at, amount FROM expenses ORDER BY created_at ASC LIMIT 5');
        console.log('Oldest 5 Expenses:');
        console.table(resOld.rows);

        // Check trends query for 'daily' manually
        const trend = await pool.query(`
            SELECT 
                DATE_TRUNC('day', created_at) as period, 
                SUM(amount) as total_amount
             FROM expenses 
             GROUP BY period 
             ORDER BY period ASC
             LIMIT 30
         `);
        console.log('Trends Query Result (First 30 ASC):');
        console.table(trend.rows);

    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

checkData();
