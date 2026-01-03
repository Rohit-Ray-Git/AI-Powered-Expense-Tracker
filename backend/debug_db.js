const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function debug() {
    try {
        const res = await pool.query(`
            SELECT count(*) FROM expenses WHERE created_at < '2026-01-01'
        `);
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}

debug();
