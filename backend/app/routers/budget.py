"""
Budget setting + AI budget recommendations + spending forecast.
"""
from collections import defaultdict
from datetime import date
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db
from app.ml.forecasting import forecast_overall_and_by_category
from app.ml.recommendation import generate_recommendations, category_history_average

router = APIRouter(tags=["budget"])


@router.post("/budget", response_model=schemas.BudgetOut, status_code=201)
def set_budget(
    payload: schemas.BudgetCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    budget = models.Budget(user_id=user.id, **payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return budget


@router.get("/budget", response_model=List[schemas.BudgetOut])
def list_budgets(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    return db.query(models.Budget).filter(models.Budget.user_id == user.id).all()


@router.get("/forecast")
def get_forecast(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Predicted next month's spending overall + per category."""
    rows = (
        db.query(models.Expense.date, models.Expense.category, models.Expense.amount)
        .filter(models.Expense.user_id == user.id, models.Expense.type == "expense")
        .all()
    )
    return forecast_overall_and_by_category(rows)


@router.get("/recommendations")
def get_recommendations(
    month: str,  # "2026-07"
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """AI-generated savings suggestions comparing this month to income + historical averages."""
    year, mon = map(int, month.split("-"))

    all_rows = (
        db.query(models.Expense.date, models.Expense.category, models.Expense.amount, models.Expense.type)
        .filter(models.Expense.user_id == user.id)
        .all()
    )

    this_month_expenses = defaultdict(float)
    income_total = 0.0
    expense_total = 0.0
    history_rows = []

    for d, cat, amount, etype in all_rows:
        if etype == "income" and d.year == year and d.month == mon:
            income_total += amount
        if etype == "expense":
            history_rows.append((d, cat or "Other", amount))
            if d.year == year and d.month == mon:
                this_month_expenses[cat or "Other"] += amount
                expense_total += amount

    hist_avg = category_history_average(history_rows)
    tips = generate_recommendations(income_total, expense_total, dict(this_month_expenses), hist_avg)

    return {
        "month": month,
        "income_total": round(income_total, 2),
        "expense_total": round(expense_total, 2),
        "savings": round(income_total - expense_total, 2),
        "by_category": {k: round(v, 2) for k, v in this_month_expenses.items()},
        "tips": tips,
    }
