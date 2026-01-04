const { Client } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const client = new Client({
    connectionString: process.env.DATABASE_URL
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS savings_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  target_amount NUMERIC(10, 2) NOT NULL CHECK (target_amount > 0),
  current_amount NUMERIC(10, 2) DEFAULT 0,
  target_date DATE,
  color VARCHAR(20) DEFAULT '#10B981',
  icon VARCHAR(50) DEFAULT '🎯',
  created_at TIMESTAMP DEFAULT NOW()
);
`;

(async () => {
    try {
        await client.connect();
        console.log('Connected to database...');

        await client.query(createTableQuery);
        console.log('Created savings_goals table successfully.');

        // Create index
        await client.query('CREATE INDEX IF NOT EXISTS idx_savings_user ON savings_goals(user_id);');
        console.log('Created index on user_id.');

    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        await client.end();
    }
})();
