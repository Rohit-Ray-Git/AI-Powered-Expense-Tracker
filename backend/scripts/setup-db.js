const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/expense_tracker'
});

async function setup() {
    try {
        await client.connect();
        console.log('🔌 Connected to database...');

        const sqlPath = path.join(__dirname, '../../init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('📝 Running init.sql...');
        await client.query(sql);

        console.log('✅ Database initialized successfully!');
    } catch (err) {
        console.error('❌ Error initializing database:', err.stack);
        console.log('\nPossible fixes:');
        console.log('1. Make sure PostgreSQL is running.');
        console.log('2. Make sure database "expense_tracker" exists (CREATE DATABASE expense_tracker;).');
        console.log('3. Check credentials in backend/.env');
    } finally {
        await client.end();
    }
}

setup();
