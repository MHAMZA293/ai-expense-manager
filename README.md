# 💰 AI Expense Manager

A full-stack personal finance app that tracks income/expenses, auto-categorizes
transactions with machine learning, forecasts next month's spending, scans
receipts with OCR, and answers natural-language questions about your money.

**Stack:** React + Tailwind (frontend) · FastAPI (backend) · SQLite/PostgreSQL
(database) · scikit-learn (categorization + forecasting) · Tesseract (OCR) ·
optional OpenAI (AI assistant)

```
React (Vite)  <---REST/JWT--->  FastAPI  <---> SQLite/PostgreSQL
                                    |
                         scikit-learn models
                         (categorize, forecast)
                                    |
                         Tesseract OCR + optional LLM
```

---

## What's implemented out of the box

| Feature | Status | Notes |
|---|---|---|
| Signup/Login (JWT, bcrypt) | ✅ working | |
| Add/Edit/Delete/Search/Filter transactions | ✅ working | |
| AI auto-categorization | ✅ working | TF-IDF + Logistic Regression, trained at startup |
| Receipt OCR scan | ✅ working | needs the Tesseract binary installed locally |
| Spending forecast | ✅ working | lightweight trend + moving-average model (no heavy deps) |
| Budget recommendations | ✅ working | rule-based, explainable |
| AI financial assistant | ✅ working | rule-based by default; upgrades to OpenAI if you add a key |
| Dashboard (pie/trend/bar charts) | ✅ working | Recharts |
| Monthly PDF report | ✅ working | reportlab |
| Notifications (budget exceeded, etc.) | 🧩 not wired up | see "Extending" below |

This is a working MVP scaffold, not a finished commercial product — it's sized
for a portfolio/resume project you can run locally in minutes and then extend.

---

## Quick start

### 1. Backend (FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # edit SECRET_KEY etc. if you like

# optional: populate demo data (demo@example.com / demo1234)
python seed_demo_data.py

uvicorn main:app --reload
```

Backend runs at **http://localhost:8000** — interactive API docs at
**http://localhost:8000/docs**.

> Receipt scanning needs the Tesseract binary installed separately (it's a
> native tool, not a Python package):
> - macOS: `brew install tesseract`
> - Ubuntu/Debian: `sudo apt-get install tesseract-ocr`
> - Windows: https://github.com/UB-Mannheim/tesseract/wiki (then set
>   `TESSERACT_CMD` in `.env`)

### 2. Frontend (React + Vite)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs at **http://localhost:5173**. Log in with the seeded demo
account, or sign up fresh.

### 3. Or with Docker

```bash
docker compose up --build
```

---

## Project structure

```
expense-manager/
├── backend/
│   ├── main.py                 # FastAPI app + router registration
│   ├── seed_demo_data.py       # optional: creates a demo user + sample data
│   ├── requirements.txt
│   ├── app/
│   │   ├── config.py           # env-based settings
│   │   ├── database.py         # SQLAlchemy engine/session
│   │   ├── models.py           # User, Expense, Budget tables
│   │   ├── schemas.py          # Pydantic request/response models
│   │   ├── auth.py             # password hashing + JWT
│   │   ├── routers/
│   │   │   ├── auth.py         # /auth/signup, /auth/login
│   │   │   ├── expenses.py     # CRUD + AI categorize + receipt scan
│   │   │   ├── budget.py       # /budget, /forecast, /recommendations
│   │   │   ├── reports.py      # /dashboard, /reports/monthly/{month}
│   │   │   └── assistant.py    # /assistant/ask
│   │   └── ml/
│   │       ├── category_classifier.py   # TF-IDF + Logistic Regression
│   │       ├── forecasting.py           # trend + moving-average forecast
│   │       ├── recommendation.py        # rule-based budget tips
│   │       └── ocr.py                   # Tesseract receipt parsing
│   └── uploads/receipts/
└── frontend/
    └── src/
        ├── api.js              # Axios instance w/ JWT interceptor
        ├── App.jsx             # routes + auth guard
        ├── pages/               Login, Signup, Dashboard, Expenses, Reports, Assistant
        └── components/          Navbar, ExpenseForm, ExpenseTable, Charts
```

---

## How each AI feature works (and how to upgrade it)

**Categorization** — `app/ml/category_classifier.py`. TF-IDF + Logistic
Regression trained on a ~80-row seed dataset at startup; retrains cheaply as
you add labeled transactions. Swap in `MultinomialNB` for classic Naive
Bayes, or replace the module with a `transformers` BERT pipeline for messier
merchant text (heavier, needs a labeled dataset per user to shine).

**Receipt OCR** — `app/ml/ocr.py`. Uses `pytesseract` to pull store name,
total, and date out of an uploaded image via regex over the OCR text. Swap
for `easyocr` (no native binary, downloads a model on first run) or the
Google Cloud Vision API (best accuracy, paid) by reimplementing
`extract_receipt_data()`.

**Spending forecast** — `app/ml/forecasting.py`. A dependency-light blend
of linear trend + recent moving average — deliberately simple since a single
user's history is usually just a handful of months. Swap in `prophet` or an
ARIMA model from `statsmodels` once you have 12+ months of data with real
seasonality, or an LSTM if you're forecasting across many users at once.

**Budget recommendations** — `app/ml/recommendation.py`. Rule-based on
purpose: comparing this month to income and to the user's own historical
category averages, so every tip is explainable ("Food is 28% above your
usual average") rather than a black box.

**AI assistant** — `app/routers/assistant.py`. A minimal RAG pattern: your
own expense rows *are* the retrieval step (already perfectly relevant, no
vector DB needed for one user's transactions). With no `OPENAI_API_KEY` set,
a rule-based fallback answers common question patterns directly from the
data — the whole app still works with zero API cost. Add a key to have an
LLM phrase nicer answers from the same retrieved facts. For a bigger app
(many users, PDFs/statements) that's the seam to plug in a real vector store
like Chroma or pgvector.

---

## Suggested build order (great for a resume writeup)

1. **Phase 1 — core app:** React UI, FastAPI, database, add/edit/delete
   expenses. *(all present here)*
2. **Phase 2 — AI features:** categorization, receipt OCR, forecasting.
   *(all present here)*
3. **Phase 3 — advanced AI:** chatbot ✅, budget recommendations ✅, then
   extend with: push/email notifications, voice expense entry (Web Speech
   API on the frontend → `/expenses`), recurring-bill detection, multi-user
   shared budgets.

## Extending: notifications

Not wired up yet, but the data you need is already exposed:
- **Budget exceeded** — compare `GET /recommendations` `expense_total` vs a
  `Budget` row for that month/category.
- **Low balance / upcoming bills** — add a `recurring` flag to `Expense` and
  a scheduled job (e.g. APScheduler or a cron hitting a new endpoint) that
  checks upcoming due dates and pushes via email (SMTP) or a service like
  OneSignal for browser push.

## Security notes before deploying for real users

- Set a strong random `SECRET_KEY` in `.env` (never commit it).
- Restrict CORS `allow_origins` in `main.py` to your actual frontend domain.
- Put the app behind HTTPS; JWTs sent over plain HTTP can be intercepted.
- Switch `DATABASE_URL` to PostgreSQL for anything beyond local demo use.
