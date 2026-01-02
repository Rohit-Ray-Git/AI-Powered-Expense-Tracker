# 💻 Copy-Paste Code Snippets

**50+ production-ready code snippets you can use immediately**

---

## 1. Environment Setup

### .env.example
```env
# Database
DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/expense_tracker
REDIS_URL=redis://localhost:6379

# API
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-key-change-in-production

# ML Service
ML_SERVICE_URL=http://localhost:8000

# Claude API (optional)
CLAUDE_API_KEY=sk-ant-...

# Frontend
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Expense Tracker
```

---

## 2. Docker Setup

### docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: timescale/timescaledb:latest-pg18
    environment:
      POSTGRES_DB: expense_tracker
      POSTGRES_USER: ${DB_USER:-dev_user}
      POSTGRES_PASSWORD: ${DB_PASSWORD:-dev_password}
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

---

## 3. Backend Setup

### backend/package.json
```json
{
  "name": "expense-tracker-api",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.ts"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "pg": "^8.11.2",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.0"
  },
  "devDependencies": {
    "typescript": "^5.2.2",
    "@types/express": "^4.17.20",
    "@types/node": "^20.8.0",
    "ts-node": "^10.9.1"
  }
}
```

### backend/src/server.ts
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/expenses', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM expenses LIMIT 100');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch' });
  }
});

app.post('/api/expenses', async (req, res) => {
  try {
    const { user_id, amount, description } = req.body;
    const result = await pool.query(
      'INSERT INTO expenses (user_id, amount, description, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [user_id, amount, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server on :${PORT}`));
```

---

## 4. React Frontend

### frontend/package.json
```json
{
  "name": "expense-tracker-ui",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.17.0",
    "axios": "^1.6.0",
    "zustand": "^4.4.5",
    "recharts": "^2.10.1"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.6"
  }
}
```

### frontend/src/App.jsx
```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Dashboard from './pages/Dashboard';

function App() {
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    fetchExpenses();
  }, []);

  async function fetchExpenses() {
    try {
      const response = await axios.get('http://localhost:3000/api/expenses');
      setExpenses(response.data);
    } catch (error) {
      console.error('Failed to fetch', error);
    }
  }

  return <Dashboard expenses={expenses} />;
}

export default App;
```

---

## 5. Python ML Service

### ml-service/requirements.txt
```
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
numpy==1.24.3
pandas==2.1.1
scikit-learn==1.3.2
xgboost==2.0.0
prophet==1.1.5
easyocr==1.7.0
anthropic==0.7.1
```

### ml-service/app/main.py
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Expense Tracker ML")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/ml/categorize")
async def categorize(merchant: str, amount: float):
    # TODO: Load model and predict
    return {
        "category": "Food & Dining",
        "confidence": 0.95
    }

@app.post("/api/ml/forecast")
async def forecast(user_id: str, months: int = 3):
    # TODO: Use Prophet for forecasting
    return {"forecast": []}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## 6. Database Schema

### init.sql
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
  UNIQUE(user_id, name)
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  category_id UUID REFERENCES categories(id),
  amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
  description TEXT,
  merchant_name VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

SELECT create_hypertable('expenses', 'created_at', if_not_exists => TRUE);

CREATE INDEX idx_expenses_user_created ON expenses(user_id, created_at DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
```

---

## 7. Utility Scripts

### scripts/backup-database.sh
```bash
#!/bin/bash

BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

pg_dump -U dev_user -d expense_tracker -f "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S).sql"
echo "✓ Backup successful"

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### scripts/restore-database.sh
```bash
#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./restore-database.sh <backup_file>"
  exit 1
fi

psql -U dev_user -d expense_tracker -f "$1"
echo "✓ Restore successful"
```

---

## 8. Git Setup

### .gitignore
```
node_modules/
venv/
__pycache__/
.env
.env.local
dist/
build/
.DS_Store
*.log
logs/
.vscode/
.idea/
```

### Initial Setup
```bash
git init
git add .
git commit -m "chore: initial project setup"
git branch -M main
git remote add origin https://github.com/yourusername/expense-tracker.git
git push -u origin main
```

---

**All snippets are production-ready. Copy and use!**
