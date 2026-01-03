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

## 💡 How It's Different

| Traditional Trackers | AI Powered Expense Tracker |
| :--- | :--- |
| Passive data entry | **Proactive** insights and advice |
| "You spent $500 on food" | "Your food spending is 20% higher than last month. Here's why..." |
| Manual categorization | **Automatic** Machine Learning classification |
| Static reports | **Conversational AI** interface |

---

## 🛠️ Technology Stack

This project uses a modern, microservices-inspired architecture:

*   **Frontend**: React, Tailwind CSS, Framer Motion (for beautiful animations).
*   **Backend**: Node.js, Express, PostgreSQL (Data persistence).
*   **ML Service**: Python, FastAPI, OpenAI GPT-4o Mini (The "Brain" of the operation).
*   **Database**: PostgreSQL with `pgvector` support (ready for future embeddings).

---

## ⚙️ How to Run

### Prerequisites
*   Node.js & npm
*   Python 3.8+
*   PostgreSQL

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Rohit-Ray-Git/AI-Powered-Expense-Tracker.git
    cd AI-Powered-Expense-Tracker
    ```

2.  **Setup Databases**:
    Ensure PostgreSQL is running and create a database (default: `expense_tracker`). Run the `init.sql` script to set up tables.

3.  **Configure Environment**:
    Create `.env` files in `backend/` and `ml-service/` with your credentials (DB URL, OpenAI API Key).

4.  **One-Command Start**:
    We've included a script to launch everything at once (Frontend, Backend, and ML Service).
    ```bash
    python start_app.py
    ```

5.  **Access the App**:
    Open `http://localhost:5173` in your browser.

---

## 🔮 Future Roadmap
*   **Receipt Scanning**: OCR to automatically add expenses from photos.
*   **Subscription Manager**: dedicated tracking for recurring bills.
*   **Goal Setting**: "Save for a Car" features with AI-driven milestones.
