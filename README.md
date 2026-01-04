# 💰 AI Powered Expense Tracker

**Not just a tracker. A personal Financial Coach.**

Traditional expense trackers are passive—they just record what you spent. This application uses **Artificial Intelligence** to actively analyze your habits, identify waste, and answer your financial questions in real-time.

![Dashboard Preview](assets/dashboard.png)

## 🚀 Key Features

### 🤖 AI Financial Coach
The standout feature of this app. It doesn't just show charts; it *understands* them.

![AI Coach & Chat](assets/advisor.png)

*   **Smart Audits**: Automatically scans your recent transactions to find savings opportunities (e.g., "You spent ₹2,000 on coffee this month. Cutting back could save you ₹24k/year").
*   **Interactive Chat**: Have a conversation with your data! Ask questions like *"Can I afford a vacation?"* or *"How much did I spend on Uber?"*, and get instant, personalized answers.

### ⚡ Smart Categorization
Stop manually selecting categories. The **ML Service** analyzes merchant names and automatically classifies transactions (e.g., "Starbucks" -> "Food", "Uber" -> "Transportation").

### 📊 Comprehensive Dashboard
*   **Overview**: Quick snapshot of total spend and recent activity.
*   **Analysis**: Deep dive into spending patterns with interactive charts.

![Deep Dive Analysis](assets/analysis.png)

*   **Budgets**: Set monthly limits for specific categories and track progress.

---

## 🛠️ Technology Stack

This project uses a modern, microservices-inspired architecture:

*   **Frontend**: React, Tailwind CSS, Framer Motion (for beautiful animations).
*   **Backend**: Node.js, Express, PostgreSQL (Data persistence).
*   **ML Service**: Python, FastAPI, OpenAI GPT-4o Mini (The "Brain" of the operation).
*   **Database**: PostgreSQL with `pgvector` support (ready for future embeddings).

---

## ⚙️ Setup & Installation

Follow these steps to get the application running on your local machine.

### 1. Prerequisites

Ensure you have the following installed:

*   **Node.js** (v18+ recommended)
    ```bash
    node -v
    npm -v
    ```
*   **Python** (v3.8+)
    ```bash
    python --version
    ```
*   **PostgreSQL** (v14+)
    ```bash
    psql --version
    ```

### 2. Database Setup

1.  **Start PostgreSQL**: Ensure your Postgres service is running.
2.  **Create User & Database**:
    You can use the default `postgres` user, but we recommend creating a dedicated user for development.
    ```bash
    # Open PostgreSQL interactive terminal
    sudo -u postgres psql

    # Inside psql shell:
    CREATE USER dev_user WITH PASSWORD 'dev_password';
    CREATE DATABASE expense_tracker;
    GRANT ALL PRIVILEGES ON DATABASE expense_tracker TO dev_user;
    \q
    ```
3.  **Initialize Schema**:
    Run the `init.sql` script to create the necessary tables.
    ```bash
    psql -U dev_user -d expense_tracker -f init.sql
    ```
    *(If prompted for password, enter `dev_password`)*

### 3. Backend Configuration

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend/` directory:
    ```env
    PORT=3000
    DATABASE_URL=postgresql://dev_user:dev_password@localhost:5432/expense_tracker
    JWT_SECRET=your_super_secret_key_change_this
    ```

### 4. ML Service Configuration

1.  Navigate to the ML service directory:
    ```bash
    cd ../ml-service
    ```
2.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
3.  Create a `.env` file in the `ml-service/` directory:
    ```env
    OPENAI_API_KEY=sk-your-openai-api-key-here
    ```

### 5. Frontend Configuration

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

---

## ▶️ Running the Application

### Option A: Quick Start (Recommended)

We have a helper script that launches all three services (Frontend, Backend, ML Service) simultaneously.

1.  From the **root** directory:
    ```bash
    python start_app.py
    ```
2.  The app will open automatically at `http://localhost:5173`.

### Option B: Manual Start (For Debugging)

Open three separate terminal windows:

**Terminal 1: Backend**
```bash
cd backend
npm run dev
```

**Terminal 2: ML Service**
```bash
cd ml-service
uvicorn app.main:app --reload --port 8000
```

**Terminal 3: Frontend**
```bash
cd frontend
npm run dev
```

---

## ❓ Troubleshooting

**Q: "Password authentication failed for user..."**
*   **Fix**: Double-check your `DATABASE_URL` in `backend/.env`. Ensure the password matches what you set in PostgreSQL.
*   **Check**: Run `psql -U dev_user -d expense_tracker` to verify you can connect manually.

**Q: "Cannot find module..." errors**
*   **Fix**: Ensure you ran `npm install` in both `backend` and `frontend` folders.

**Q: ML Service fails to start**
*   **Fix**: Verify your `OPENAI_API_KEY` is correct. The ML service requires a valid key to initialize.

**Q: Frontend shows "Network Error"**
*   **Fix**: Ensure both the Backend (Port 3000) and ML Service (Port 8000) are running.

---

## 📂 Project Structure

```
AI-Powered-Expense-Tracker/
├── backend/            # Express.js API
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── middleware/ # Auth & Validation
│   │   └── db.ts       # Database connection
├── frontend/           # React Application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   └── pages/      # Main application views
├── ml-service/         # Python FastAPI AI Service
│   └── app/
│       └── main.py     # AI Logic & Endpoints
├── init.sql            # Database Schema
└── start_app.py        # Launcher Script
```
