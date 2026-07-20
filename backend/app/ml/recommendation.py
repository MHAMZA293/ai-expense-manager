"""
Budget Recommendation
-----------------------
Rule-based (explainable) engine that compares this month's spending to
income and to the user's own historical averages, and produces
human-readable savings suggestions. Deliberately simple/transparent
rather than a black-box model, since "why is it telling me this" matters
for a finance tool.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Dict, List, Tuple


def generate_recommendations(
    income_total: float,
    expense_total: float,
    this_month_by_category: Dict[str, float],
    historical_avg_by_category: Dict[str, float],
) -> List[str]:
    tips: List[str] = []

    if income_total > 0:
        savings_rate = (income_total - expense_total) / income_total * 100
        if savings_rate < 0:
            tips.append(
                f"You're spending {abs(savings_rate):.0f}% more than you earned this month — "
                "expenses exceeded income."
            )
        elif savings_rate < 10:
            tips.append(
                f"You're only saving about {savings_rate:.0f}% of your income this month. "
                "Financial experts commonly suggest aiming for 20%."
            )
        else:
            tips.append(f"Nice work — you saved roughly {savings_rate:.0f}% of your income this month.")

    for cat, amount in this_month_by_category.items():
        avg = historical_avg_by_category.get(cat)
        if avg and avg > 0:
            diff_pct = (amount - avg) / avg * 100
            if diff_pct >= 20:
                tips.append(f"{cat} spending is {diff_pct:.0f}% above your usual average — consider cutting back.")
            elif diff_pct <= -20:
                tips.append(f"Great job — {cat} spending is {abs(diff_pct):.0f}% below your usual average.")

    if not tips:
        tips.append("Your spending looks consistent with your usual patterns this month.")

    return tips


def category_history_average(rows: List[Tuple[date, str, float]]) -> Dict[str, float]:
    """rows: (date, category, amount) across all history -> per-category monthly average."""
    monthly_by_cat: Dict[str, Dict[str, float]] = defaultdict(lambda: defaultdict(float))
    for d, cat, amount in rows:
        key = f"{d.year:04d}-{d.month:02d}"
        monthly_by_cat[cat or "Other"][key] += amount

    averages = {}
    for cat, months in monthly_by_cat.items():
        values = list(months.values())
        averages[cat] = sum(values) / len(values) if values else 0.0
    return averages
