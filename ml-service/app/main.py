from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os

app = FastAPI(title="Expense Tracker ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ml-service"}

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
    uvicorn.run(app, host="0.0.0.0", port=8000)
