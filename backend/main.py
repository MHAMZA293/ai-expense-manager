"""
AI Expense Manager — FastAPI entrypoint.

Run locally:
    pip install -r requirements.txt
    cp .env.example .env          # then edit values as needed
    uvicorn main:app --reload

Interactive API docs then live at http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app.routers import auth, expenses, budget, reports, assistant

Base.metadata.create_all(bind=engine)  # creates tables on first run (SQLite by default)

app = FastAPI(
    title="AI Expense Manager API",
    description="Track, categorize, forecast, and get AI insights on personal expenses.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(budget.router)
app.include_router(reports.router)
app.include_router(assistant.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Expense Manager API is running. See /docs for the API reference."}


@app.get("/health")
def health():
    return {"status": "healthy"}
