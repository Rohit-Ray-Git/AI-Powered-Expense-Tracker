const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const categories = [
    { name: 'Food', icon: '🍔' },
    { name: 'Transportation', icon: '🚗' },
    { name: 'Entertainment', icon: '🎬' },
    { name: 'Shopping', icon: '🛍️' },
    { name: 'Utilities', icon: '💡' },
    { name: 'Housing', icon: '🏠' },
    { name: 'Health', icon: '⚕️' },
    { name: 'Travel', icon: '✈️' }
];

const transactions = [
    // Recurring / Fixed
    { desc: 'Rent Payment', amount: 15000, cat: 'Housing', merchant: 'Landlord' },
    { desc: 'Electricity Bill', amount: 1200, cat: 'Utilities', merchant: 'Power Corp' },
    { desc: 'Broadband Bill', amount: 999, cat: 'Utilities', merchant: 'JioFiber' },
    { desc: 'Netflix Subscription', amount: 649, cat: 'Entertainment', merchant: 'Netflix' },
    { desc: 'Spotify Premium', amount: 119, cat: 'Entertainment', merchant: 'Spotify' },
    { desc: 'Gym Membership', amount: 2000, cat: 'Health', merchant: 'Gold Gym' },

    // Patterns (Daily Coffee)
    { desc: 'Morning Coffee', amount: 250, cat: 'Food', merchant: 'Starbucks' },
    { desc: 'Morning Coffee', amount: 250, cat: 'Food', merchant: 'Starbucks' },
    { desc: 'Morning Coffee', amount: 250, cat: 'Food', merchant: 'Starbucks' },
    { desc: 'Morning Coffee', amount: 250, cat: 'Food', merchant: 'Starbucks' },
    { desc: 'Morning Coffee', amount: 250, cat: 'Food', merchant: 'Starbucks' },

    // Patterns (Frequent Uber)
    { desc: 'Ride to Work', amount: 350, cat: 'Transportation', merchant: 'Uber' },
    { desc: 'Ride Home', amount: 380, cat: 'Transportation', merchant: 'Uber' },
    { desc: 'Ride to Mall', amount: 200, cat: 'Transportation', merchant: 'Ola' },
    { desc: 'Late Night Ride', amount: 500, cat: 'Transportation', merchant: 'Uber' },

    // Dining Out
    { desc: 'Dinner with friends', amount: 2500, cat: 'Food', merchant: 'Barbeque Nation' },
    { desc: 'Lunch Break', amount: 300, cat: 'Food', merchant: 'Subway' },
    { desc: 'Weekend Pizza', amount: 800, cat: 'Food', merchant: 'Dominos' },
    { desc: 'Ice Cream', amount: 150, cat: 'Food', merchant: 'Baskin Robbins' },

    // Shopping Spree
    { desc: 'New Sneakers', amount: 4500, cat: 'Shopping', merchant: 'Nike' },
    { desc: 'Grocery Run', amount: 2000, cat: 'Shopping', merchant: 'BigBasket' },
    { desc: 'Pharmacy', amount: 500, cat: 'Health', merchant: 'Apollo Pharmacy' },

    // "Mistake" (Double charged or forgotten sub)
    { desc: 'Amazon Prime', amount: 1499, cat: 'Entertainment', merchant: 'Amazon' },
    { desc: 'Unknown Charge', amount: 1499, cat: 'Entertainment', merchant: 'Amazon Prime Video' }, // Duplicate-ish
];

async function seed() {
    try {
        console.log('🌱 Seeding dummy data...');

        // 1. Get ALL Users
        const userRes = await pool.query('SELECT id, email FROM users');
        if (userRes.rowCount === 0) {
            console.error('❌ No user found! Please register a user first.');
            process.exit(1);
        }

        console.log(`Found ${userRes.rowCount} users. Seeding for all...`);

        for (const user of userRes.rows) {
            const userId = user.id;
            console.log(`👤 Seeding for user: ${user.email} (${userId})`);

            // 2. Upsert Categories for this user
            const catMap = {};
            for (const cat of categories) {
                const res = await pool.query(
                    `INSERT INTO categories (name, icon, user_id) 
                     VALUES ($1, $2, $3) 
                     ON CONFLICT (name, user_id) DO UPDATE SET icon = EXCLUDED.icon
                     RETURNING id`,
                    [cat.name, cat.icon, userId]
                );
                catMap[cat.name] = res.rows[0].id;
            }

            // 3. Insert Transactions (Spread over last 30 days)
            for (const t of transactions) {
                // Random date within last 30 days
                const daysAgo = Math.floor(Math.random() * 30);
                const date = new Date();
                date.setDate(date.getDate() - daysAgo);

                await pool.query(
                    `INSERT INTO expenses (user_id, amount, description, category_id, merchant_name, created_at)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [userId, t.amount, t.desc, catMap[t.cat], t.merchant, date]
                );
            }
        }

        console.log('✅ Seeding complete! Added ~' + transactions.length + ' transactions per user.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error seeding data:', error);
        process.exit(1);
    }
}

seed();
