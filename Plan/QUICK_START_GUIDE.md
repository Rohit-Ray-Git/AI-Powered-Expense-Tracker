# ⚡ Quick Start Guide: Building the Open-Source Expense Tracker

**Time to first working prototype: 2 hours**  
**Time to MVP: 2 weeks (part-time)**

---

## Step 1: Project Setup (30 minutes)

### Initialize Repositories

```bash
# Create project directory
mkdir expense-tracker && cd expense-tracker

# Frontend (React)
npm create vite@latest frontend -- --template react
cd frontend
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom axios zustand recharts date-fns
npm install -D @tailwindcss/forms @tailwindcss/typography
npx tailwindcss init -p

# Backend (Express.js)
cd ..
mkdir backend && cd backend
npm init -y
npm install express cors dotenv axios bcryptjs jsonwebtoken pg
npm install -D typescript @types/express @types/node ts-node nodemon
npx tsc --init

# ML Service (Python)
cd ..
mkdir ml-service && cd ml-service
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install fastapi uvicorn sqlalchemy python-multipart numpy pandas scikit-learn xgboost prophet easyocr torch anthropic
```

### Set Up Docker Compose

```yaml
# docker-compose.yml (in root)
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg18
    environment:
      POSTGRES_DB: expense_tracker
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

**Run it:**
```bash
docker-compose up -d
```

---

## Step 2: Database Schema (30 minutes)

### Create init.sql

```sql
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50) DEFAULT '📁',
  color VARCHAR(7) DEFAULT '#3b82f6',
  UNIQUE(user_id, name)
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT,
  merchant_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

SELECT create_hypertable('expenses', 'created_at', if_not_exists => TRUE);

CREATE INDEX idx_expenses_user ON expenses(user_id);
CREATE INDEX idx_expenses_created ON expenses(created_at DESC);
```

---

## Step 3: Backend API (1 hour)

### Express.js Server

```typescript
// backend/src/server.ts
import express from 'express';
import cors from 'cors';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 
    'postgresql://dev_user:dev_password@localhost:5432/expense_tracker'
});

const app = express();
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [email, password] // TODO: hash password with bcrypt
    );
    res.json({ user: result.rows[0], token: 'jwt-token' });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Expense routes
app.get('/api/expenses', async (req, res) => {
  const { user_id, period = 'month' } = req.query;
  try {
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
      [user_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/expenses', async (req, res) => {
  const { user_id, amount, description, merchant_name, category_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO expenses (user_id, amount, description, merchant_name, category_id, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *`,
      [user_id, amount, description, merchant_name, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create' });
  }
});

app.listen(3000, () => console.log('✅ Server on :3000'));
```

**Run:**
```bash
npm run dev
```

---

## Step 4: React Frontend (1 hour)

### Dashboard Component

```jsx
// frontend/src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const response = await axios.get('http://localhost:3000/api/expenses?user_id=test');
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch', error);
    } finally {
      setLoading(false);
    }
  }

  const total = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const byCategory = expenses.reduce((acc, e) => {
    const existing = acc.find(c => c.name === e.category_id);
    if (existing) {
      existing.value += parseFloat(e.amount);
    } else {
      acc.push({ name: e.category_id || 'Other', value: parseFloat(e.amount) });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Expense Tracker</h1>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600">Total Spent</p>
            <p className="text-4xl font-bold text-indigo-600">${total.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600">Transactions</p>
            <p className="text-4xl font-bold text-indigo-600">{expenses.length}</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow">
            <p className="text-gray-600">Daily Avg</p>
            <p className="text-4xl font-bold text-indigo-600">${(total/30).toFixed(2)}</p>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-lg font-bold mb-4">Spending by Category</h2>
          {byCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {byCategory.map((_, i) => <Cell key={i} fill={['#3b82f6', '#ef4444', '#10b981'][i % 3]} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No expenses yet</p>
          )}
        </div>

        {/* Recent */}
        <div className="bg-white rounded-lg p-6 shadow mt-8">
          <h2 className="text-lg font-bold mb-4">Recent Expenses</h2>
          <div className="space-y-2">
            {expenses.map(exp => (
              <div key={exp.id} className="flex justify-between border-b py-2">
                <div>
                  <p className="font-medium">{exp.merchant_name}</p>
                  <p className="text-sm text-gray-600">{exp.description}</p>
                </div>
                <p className="font-bold text-indigo-600">${parseFloat(exp.amount).toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Step 5: Running Everything (15 minutes)

```bash
# Terminal 1: Start database
docker-compose up -d

# Terminal 2: Start backend
cd backend
npm run dev
# ✅ Server on :3000

# Terminal 3: Start frontend
cd frontend
npm run dev
# ✅ http://localhost:5173

# Terminal 4: Start ML service (optional)
cd ml-service
source venv/bin/activate
python -m uvicorn app.main:app --reload
# ✅ http://localhost:8000
```

---

## ✅ What You've Built

After 2 hours, you have:
- ✅ PostgreSQL database running
- ✅ Express.js backend with expense CRUD
- ✅ React dashboard showing expenses
- ✅ Working locally with Docker

**That's your MVP foundation!**

---

## 🚀 Next Steps

1. **Week 1-4:** Follow `IMPLEMENTATION_TIMELINE.md`
2. **Add authentication** (JWT)
3. **Add frontend forms** (add expense page)
4. **Add charts** (Recharts)
5. **Deploy to staging**

---

**Now follow `IMPLEMENTATION_TIMELINE.md` to build the full app!**
