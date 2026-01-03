const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const STANDARD_CATEGORIES = [
    { name: 'Housing', icon: '🏠' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Food', icon: '🍔' },
    { name: 'Transportation', icon: '🚗' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Health', icon: '🏥' },
    { name: 'Education', icon: '🎓' },
    { name: 'Financial', icon: '💸' },
    { name: 'Travel', icon: '✈️' },
    { name: 'Gifts & Donations', icon: '🎁' },
    { name: 'Miscellaneous', icon: '❓' },
];

async function migrateAndSeed() {
    const client = await pool.connect();
    try {
        console.log('🔄 Starting migration...');

        // 1. Alter table to allow NULL user_id (Global categories)
        await client.query('ALTER TABLE categories ALTER COLUMN user_id DROP NOT NULL');
        console.log('✅ Altered categories table (user_id is now nullable).');

        // 2. Drop existing unique constraint if it clashes (or we just deal with it)
        // The existing constraint is UNIQUE(user_id, name). NULLs usually don't conflict in standard SQL unique constraints.
        // But we want to ensure we don't have duplicates of "Food" in global space.
        // Let's create a unique index for global categories.
        await client.query('CREATE UNIQUE INDEX IF NOT EXISTS idx_global_categories ON categories(name) WHERE user_id IS NULL');
        console.log('✅ Created unique index for global categories.');

        // 3. Seed Categories
        console.log('🌱 Seeding standard categories...');
        for (const cat of STANDARD_CATEGORIES) {
            // Upsert logic for global categories
            const query = `
        INSERT INTO categories (name, icon, user_id)
        VALUES ($1, $2, NULL)
        ON CONFLICT (name) WHERE user_id IS NULL DO UPDATE
        SET icon = EXCLUDED.icon
        RETURNING id;
      `;
            const res = await client.query(query, [cat.name, cat.icon]);
            console.log(`   - Seeded: ${cat.icon} ${cat.name}`);
        }

        console.log('✨ Migration and Seeding Complete!');
    } catch (err) {
        console.error('❌ Error during migration:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

migrateAndSeed();
