"""
AI Financial Assistant
------------------------
Answers natural-language questions about the user's own expenses, e.g.
"How much did I spend on food last month?" or "Show my highest expense."

Design: this is a light Retrieval-Augmented Generation (RAG) pattern —
"retrieval" here is simply querying the user's own SQL rows (already
perfectly relevant, no vector DB needed for a single user's transactions),
then either:
  1. If OPENAI_API_KEY is set, the retrieved facts are handed to an LLM
     to phrase a natural answer, or
  2. Otherwise, a rule-based fallback answers common question patterns
     directly from the data — so the whole app still works with zero
     API keys/cost, which matters for a portfolio demo.

For a bigger dataset (many users, long transaction history, documents
like bills/statements) you'd add a real vector store (e.g. Chroma,
pgvector, FAISS) and embed transaction summaries — the retrieval step
below is the seam where that would plug in.
"""
import re
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.config import settings
from app.database import get_db

router = APIRouter(tags=["assistant"])


def _month_bounds(year: int, month: int):
    start = date(year, month, 1)
    end = date(year + (month == 12), (month % 12) + 1, 1)
    return start, end


def _last_month():
    today = date.today()
    y, m = (today.year, today.month - 1) if today.month > 1 else (today.year - 1, 12)
    return y, m


def _retrieve_context(db: Session, user: models.User) -> dict:
    """Pull the facts an LLM (or the rule-based fallback) needs to answer most questions."""
    rows = (
        db.query(models.Expense)
        .filter(models.Expense.user_id == user.id, models.Expense.type == "expense")
        .all()
    )
    by_category_total = defaultdict(float)
    for e in rows:
        by_category_total[e.category or "Other"] += e.amount

    y, m = _last_month()
    start, end = _month_bounds(y, m)
    last_month_rows = [e for e in rows if start <= e.date < end]
    last_month_by_cat = defaultdict(float)
    for e in last_month_rows:
        last_month_by_cat[e.category or "Other"] += e.amount

    highest = max(rows, key=lambda e: e.amount, default=None)

    return {
        "by_category_total": dict(by_category_total),
        "last_month": f"{y:04d}-{m:02d}",
        "last_month_by_category": dict(last_month_by_cat),
        "last_month_total": sum(last_month_by_cat.values()),
        "highest_expense": (
            {"description": highest.description, "amount": highest.amount, "date": str(highest.date),
             "category": highest.category} if highest else None
        ),
        "total_spent_all_time": sum(by_category_total.values()),
    }


def _rule_based_answer(question: str, ctx: dict) -> str:
    q = question.lower()

    cat_match = None
    for cat in ["food", "transport", "shopping", "bills", "entertainment", "health",
                "education", "rent", "groceries", "travel"]:
        if cat in q:
            cat_match = cat.capitalize()
            break

    if "highest" in q or "biggest" in q or "largest" in q:
        h = ctx["highest_expense"]
        if not h:
            return "You don't have any expenses recorded yet."
        return f"Your highest expense is \"{h['description']}\" for ${h['amount']:.2f} on {h['date']} ({h['category']})."

    if "last month" in q and cat_match:
        amt = ctx["last_month_by_category"].get(cat_match, 0)
        return f"You spent ${amt:.2f} on {cat_match} last month ({ctx['last_month']})."

    if "last month" in q:
        return f"You spent ${ctx['last_month_total']:.2f} in total last month ({ctx['last_month']})."

    if cat_match:
        amt = ctx["by_category_total"].get(cat_match, 0)
        return f"You've spent ${amt:.2f} on {cat_match} in total."

    if "save" in q or "saving" in q:
        if not ctx["by_category_total"]:
            return "Add a few expenses first and I can point out where you might save money."
        top_cat = max(ctx["by_category_total"].items(), key=lambda x: x[1])
        return (
            f"Your biggest spending category overall is {top_cat[0]} at ${top_cat[1]:.2f}. "
            "That's usually the best place to look for savings — check the Recommendations "
            "panel for category-by-category tips."
        )

    if "total" in q:
        return f"You've spent ${ctx['total_spent_all_time']:.2f} in total across all recorded expenses."

    return (
        "I can answer questions like \"How much did I spend on food last month?\", "
        "\"Show my highest expense\", or \"Where can I save money?\" — try rephrasing your question "
        "around a category, a time period, or your highest expense."
    )


def _llm_answer(question: str, ctx: dict) -> str:
    """Optional: use OpenAI to phrase a nicer answer from the same retrieved facts."""
    from openai import OpenAI

    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    system = (
        "You are a helpful personal finance assistant. Answer the user's question ONLY using "
        "the JSON data provided as context. Be concise (1-3 sentences). Never invent numbers "
        "that aren't in the context."
    )
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": f"Context data: {ctx}\n\nQuestion: {question}"},
        ],
        max_tokens=200,
    )
    return completion.choices[0].message.content.strip()


@router.post("/assistant/ask", response_model=schemas.AssistantAnswer)
def ask_assistant(
    payload: schemas.AssistantQuery,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    ctx = _retrieve_context(db, user)

    if settings.OPENAI_API_KEY:
        try:
            answer = _llm_answer(payload.question, ctx)
        except Exception:
            answer = _rule_based_answer(payload.question, ctx)  # fail safe, no key/quota issues shown to user
    else:
        answer = _rule_based_answer(payload.question, ctx)

    return schemas.AssistantAnswer(answer=answer, data=ctx)
