from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

app = FastAPI(title="Expense Tracker ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class Transaction(BaseModel):
    merchant: str
    amount: float

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ml-service"}

@app.post("/api/ml/categorize")
async def categorize(transaction: Transaction):
    try:
        prompt = f"""
        Categorize the following transaction into one of these categories:
        - Food & Dining
        - Transportation
        - Shopping
        - Utilities
        - Entertainment
        - Travel
        - Health & Fitness
        - Personal Care
        - Education
        - Miscellaneous

        Merchant: {transaction.merchant}
        Amount: {transaction.amount}

        Return ONLY the category name.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=10
        )
        
        category = response.choices[0].message.content.strip()
        return {
            "category": category,
            "confidence": 0.9 # Placeholder
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"category": "Miscellaneous", "confidence": 0.0}

@app.post("/api/ml/forecast")
async def forecast(user_id: str, months: int = 3):
    # TODO: Use Prophet for forecasting
    return {"forecast": []}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
