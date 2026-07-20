"""
AI Expense Categorization
--------------------------
A lightweight text classifier that predicts a spending category from a
free-text description like "McDonald's - $15" or "Uber ride $20".

Default model: TF-IDF + Logistic Regression (scikit-learn). This trains
in well under a second on a few hundred rows and needs no GPU, making it
practical for a portfolio project and easy to retrain per-user.

Swap-in options (see README for notes):
  - MultinomialNB (Naive Bayes) — swap LogisticRegression for MultinomialNB
  - BERT — replace this whole module with a sentence-transformers /
    transformers pipeline fine-tuned on labeled transactions; heavier but
    handles messier merchant text much better.

The model is trained once at startup on SEED_DATA below plus (optionally)
any already-categorized transactions from the database, so it keeps
improving as the user categorizes/edits expenses.
"""
from __future__ import annotations

import re
from typing import Iterable, List, Tuple

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline

CATEGORIES = [
    "Food", "Transport", "Shopping", "Bills", "Entertainment",
    "Health", "Education", "Rent", "Groceries", "Travel", "Other",
]

# Seed dataset: (description, category). Small but broad enough for a
# working demo classifier; extend freely.
SEED_DATA: List[Tuple[str, str]] = [
    ("McDonald's", "Food"), ("KFC dinner", "Food"), ("Starbucks coffee", "Food"),
    ("Domino's pizza", "Food"), ("Burger King", "Food"), ("local restaurant lunch", "Food"),
    ("Subway sandwich", "Food"), ("cafe latte", "Food"), ("food delivery", "Food"),

    ("Uber ride", "Transport"), ("Lyft ride", "Transport"), ("taxi fare", "Transport"),
    ("bus ticket", "Transport"), ("metro card top up", "Transport"), ("fuel petrol", "Transport"),
    ("parking fee", "Transport"), ("car service", "Transport"), ("train ticket", "Transport"),

    ("Amazon order", "Shopping"), ("Walmart purchase", "Shopping"), ("new shoes", "Shopping"),
    ("clothing store", "Shopping"), ("electronics store", "Shopping"), ("online shopping", "Shopping"),
    ("Target purchase", "Shopping"), ("IKEA furniture", "Shopping"),

    ("electricity bill", "Bills"), ("water bill", "Bills"), ("internet bill", "Bills"),
    ("phone bill", "Bills"), ("gas bill", "Bills"), ("insurance premium", "Bills"),
    ("subscription Netflix", "Bills"),

    ("movie tickets", "Entertainment"), ("concert tickets", "Entertainment"), ("Spotify subscription", "Entertainment"),
    ("video game purchase", "Entertainment"), ("bowling night", "Entertainment"), ("streaming service", "Entertainment"),

    ("pharmacy purchase", "Health"), ("doctor visit", "Health"), ("dentist appointment", "Health"),
    ("gym membership", "Health"), ("health insurance", "Health"), ("medicine", "Health"),

    ("tuition fee", "Education"), ("textbooks", "Education"), ("online course", "Education"),
    ("school supplies", "Education"), ("exam fee", "Education"),

    ("monthly rent", "Rent"), ("apartment rent", "Rent"), ("landlord payment", "Rent"),

    ("grocery store", "Groceries"), ("supermarket run", "Groceries"), ("vegetables and fruit", "Groceries"),
    ("weekly groceries", "Groceries"), ("butcher shop", "Groceries"),

    ("flight tickets", "Travel"), ("hotel booking", "Travel"), ("vacation package", "Travel"),
    ("Airbnb stay", "Travel"), ("visa fee", "Travel"),

    ("miscellaneous purchase", "Other"), ("gift for friend", "Other"), ("donation", "Other"),
    ("bank fee", "Other"), ("ATM withdrawal", "Other"),
]

_AMOUNT_RE = re.compile(r"[$₹€£]?\s?\d+(\.\d+)?")


def _clean(text: str) -> str:
    """Strip currency amounts/numbers so the model focuses on merchant/item words."""
    text = _AMOUNT_RE.sub(" ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    return text.lower().strip()


class CategoryClassifier:
    def __init__(self):
        self.pipeline: Pipeline | None = None
        self.fit(SEED_DATA)

    def fit(self, rows: Iterable[Tuple[str, str]]):
        rows = list(rows)
        X = [_clean(desc) for desc, _ in rows]
        y = [cat for _, cat in rows]
        self.pipeline = Pipeline([
            ("tfidf", TfidfVectorizer(ngram_range=(1, 2), min_df=1)),
            ("clf", LogisticRegression(max_iter=1000)),
        ])
        self.pipeline.fit(X, y)

    def retrain_with_extra(self, extra_rows: Iterable[Tuple[str, str]]):
        """Retrain combining seed data with real labeled transactions from the DB."""
        self.fit(list(SEED_DATA) + list(extra_rows))

    def predict(self, description: str) -> str:
        if not self.pipeline:
            return "Other"
        cleaned = _clean(description)
        if not cleaned:
            return "Other"
        return self.pipeline.predict([cleaned])[0]

    def predict_proba(self, description: str):
        cleaned = _clean(description)
        proba = self.pipeline.predict_proba([cleaned])[0]
        classes = self.pipeline.classes_
        return sorted(zip(classes, proba), key=lambda x: -x[1])


# Singleton instance used across the app (trained once at import/startup time)
classifier = CategoryClassifier()
