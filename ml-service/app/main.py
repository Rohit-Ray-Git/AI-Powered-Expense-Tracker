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
    # 1. Keyword Matching (Offline Mode)
    merchant_lower = transaction.merchant.lower()
    
    keywords = {
        "food": ["starbucks", "mcdonalds", "burger", "pizza", "coffee", "cafe", "restaurant", "dining", "lunch", "dinner"],
        "transportation": ["uber", "lyft", "taxi", "bus", "train", "metro", "gas", "fuel", "parking"],
        "entertainment": ["netflix", "spotify", "hulu", "steam", "cinema", "movie", "game"],
        "shopping": ["amazon", "walmart", "target", "clothing", "shoe", "store"],
        "utilities": ["water", "electric", "power", "internet", "wifi", "bill"],
        "housing": ["rent", "mortgage", "lease"],
        "health": ["doctor", "pharmacy", "medical", "gym", "fitness"],
        "travel": ["hotel", "flight", "airbnb", "airline"],
    }

    for category, tags in keywords.items():
        if any(tag in merchant_lower for tag in tags):
            # Capitalize first letter to match DB
            return {"category": category.title(), "confidence": 1.0}

    # 2. OpenAI Fallback
    try:
        prompt = f"""
        Categorize the following transaction into one of these EXACT categories:
        - Housing
        - Utilities
        - Food
        - Transportation
        - Entertainment
        - Shopping
        - Health
        - Education
        - Financial
        - Travel
        - Gifts & Donations
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
            "confidence": 0.9
        }
    except Exception as e:
        print(f"Error: {e}")
        return {"category": "Miscellaneous", "confidence": 0.0}
    except Exception as e:
        print(f"Error: {e}")
        return {"category": "Miscellaneous", "confidence": 0.0}

from typing import List

class ExpenseItem(BaseModel):
    description: str
    amount: float
    category: str = "Uncategorized"
    date: str = ""

class ExpenseList(BaseModel):
    expenses: List[ExpenseItem]

@app.post("/api/ml/audit")
async def audit_expenses(data: ExpenseList):
    try:
        # Prepare context for LLM
        expenses_text = "\n".join([f"- {e.description}: {e.amount} ({e.category})" for e in data.expenses[:50]])
        
        prompt = f"""
        Act as a savvy financial coach. Analyze these recent expenses and identify 3 specific, actionable saving opportunities, insights, or warnings.
        
        Expenses:
        {expenses_text}
        
        Return a JSON object with a key "insights" containing a list of 3 items. Each item must have:
        - "title": Short, punchy title (e.g. "Coffee Habit Alert").
        - "message": A 1-2 sentence friendly advice or observation.
        - "type": One of "warning", "tip", "kudos", "saving".
        - "potential_savings": Estimated numeric savings amount (number only) or 0 if not applicable.
        
        Output JSON only.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful financial assistant that outputs JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.5,
            response_format={"type": "json_object"}
        )
        
        content = response.choices[0].message.content
        import json
        result = json.loads(content)
        return result
        
    except Exception as e:
        print(f"Error generating audit: {e}")
        # Return fallback advice if LLM fails
        return {
            "insights": [
                {
                    "title": "Track your Cash",
                    "message": "Try categorizing more transactions to get better insights.",
                    "type": "tip",
                    "potential_savings": 0
                }
            ]
        }

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: List[ExpenseItem] = []

@app.post("/api/ml/chat")
async def chat_with_advisor(data: ChatRequest):
    try:
        # Prepare context
        expenses_text = "\n".join([f"- {e.description}: {e.amount} ({e.category})" for e in data.context[:20]])
        
        system_prompt = f"""
        You are a helpful, friendly, and savvy financial coach. 
        You have access to the user's recent expenses:
        {expenses_text}
        
        Answer the user's questions based on this data. 
        Be concise (max 2-3 sentences). 
        If asked about savings, point out specific wasteful spending from the list.
        If the user asks something unrelated to finance, politely steer them back to money topics.
        """
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": data.message}
            ],
            temperature=0.7,
            max_tokens=150
        )
        
        return {"response": response.choices[0].message.content}
        
    except Exception as e:
        print(f"Error in chat: {e}")
        return {"response": "I'm having trouble thinking right now. Please try again later."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
