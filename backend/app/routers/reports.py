"""
Dashboard summary data + monthly PDF report generation (reportlab).
"""
import os
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from sqlalchemy.orm import Session

from app import models
from app.auth import get_current_user
from app.database import get_db
from app.ml.recommendation import generate_recommendations, category_history_average

router = APIRouter(tags=["reports"])

REPORT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "reports")
os.makedirs(REPORT_DIR, exist_ok=True)


@router.get("/dashboard")
def dashboard_summary(db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Everything the React dashboard needs in one call: totals, pie/trend chart data."""
    rows = (
        db.query(models.Expense.date, models.Expense.category, models.Expense.amount, models.Expense.type)
        .filter(models.Expense.user_id == user.id)
        .all()
    )

    income_total = sum(a for _, _, a, t in rows if t == "income")
    expense_total = sum(a for _, _, a, t in rows if t == "expense")

    by_category = defaultdict(float)
    monthly_income = defaultdict(float)
    monthly_expense = defaultdict(float)

    for d, cat, amount, etype in rows:
        month_key = f"{d.year:04d}-{d.month:02d}"
        if etype == "expense":
            by_category[cat or "Other"] += amount
            monthly_expense[month_key] += amount
        else:
            monthly_income[month_key] += amount

    months = sorted(set(monthly_income) | set(monthly_expense))
    trend = [
        {"month": m, "income": round(monthly_income.get(m, 0), 2), "expenses": round(monthly_expense.get(m, 0), 2)}
        for m in months
    ]
    top_categories = sorted(by_category.items(), key=lambda x: -x[1])[:5]

    return {
        "total_income": round(income_total, 2),
        "total_expenses": round(expense_total, 2),
        "savings": round(income_total - expense_total, 2),
        "by_category": {k: round(v, 2) for k, v in by_category.items()},
        "monthly_trend": trend,
        "top_categories": [{"category": c, "amount": round(a, 2)} for c, a in top_categories],
    }


@router.get("/reports/monthly/{month}")
def monthly_report_pdf(month: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """
    Generates a downloadable PDF for the given month ("2026-07") containing
    totals, a category breakdown table, and AI-generated insights.
    """
    year, mon = map(int, month.split("-"))

    all_rows = (
        db.query(models.Expense.date, models.Expense.category, models.Expense.amount, models.Expense.type)
        .filter(models.Expense.user_id == user.id)
        .all()
    )

    income_total, expense_total = 0.0, 0.0
    by_category = defaultdict(float)
    history_rows = []

    for d, cat, amount, etype in all_rows:
        if etype == "expense":
            history_rows.append((d, cat or "Other", amount))
        if d.year == year and d.month == mon:
            if etype == "income":
                income_total += amount
            else:
                expense_total += amount
                by_category[cat or "Other"] += amount

    hist_avg = category_history_average(history_rows)
    tips = generate_recommendations(income_total, expense_total, dict(by_category), hist_avg)

    file_path = os.path.join(REPORT_DIR, f"{user.id}_{month}.pdf")
    _build_pdf(file_path, user.name, month, income_total, expense_total, by_category, tips)

    return FileResponse(file_path, filename=f"expense_report_{month}.pdf", media_type="application/pdf")


def _build_pdf(path, user_name, month, income_total, expense_total, by_category, tips):
    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(path, pagesize=A4)
    elements = []

    elements.append(Paragraph(f"Monthly Financial Report — {month}", styles["Title"]))
    elements.append(Paragraph(f"Prepared for {user_name}", styles["Normal"]))
    elements.append(Spacer(1, 0.5 * cm))

    summary_data = [
        ["Total Income", f"${income_total:,.2f}"],
        ["Total Expenses", f"${expense_total:,.2f}"],
        ["Savings", f"${income_total - expense_total:,.2f}"],
    ]
    summary_table = Table(summary_data, colWidths=[8 * cm, 6 * cm])
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.7 * cm))

    elements.append(Paragraph("Spending by Category", styles["Heading2"]))
    cat_data = [["Category", "Amount"]] + [[c, f"${a:,.2f}"] for c, a in sorted(by_category.items(), key=lambda x: -x[1])]
    cat_table = Table(cat_data, colWidths=[8 * cm, 6 * cm])
    cat_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#2563eb")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("PADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(cat_table)
    elements.append(Spacer(1, 0.7 * cm))

    elements.append(Paragraph("AI-Generated Insights", styles["Heading2"]))
    for tip in tips:
        elements.append(Paragraph(f"• {tip}", styles["Normal"]))

    doc.build(elements)
