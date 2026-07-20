# 💰 AI Expense Manager

A full-stack AI-powered personal finance management application that helps users track income and expenses, automatically categorize transactions, scan receipts, forecast spending, and get intelligent insights about their financial habits.

Built with **React, FastAPI, machine learning, OCR, and optional LLM integration**.

---

## 🚀 Features

| Feature                   | Status  | Description                                              |
| ------------------------- | ------- | -------------------------------------------------------- |
| 🔐 Authentication         | ✅       | Secure signup/login with JWT + bcrypt password hashing   |
| 💳 Expense Management     | ✅       | Add, edit, delete, search, and filter transactions       |
| 🤖 AI Categorization      | ✅       | Automatically classifies expenses using machine learning |
| 🧾 Receipt Scanner        | ✅       | Extracts expense details using OCR                       |
| 📈 Spending Forecast      | ✅       | Predicts future spending trends                          |
| 💡 Budget Recommendations | ✅       | Provides explainable financial suggestions               |
| 💬 AI Financial Assistant | ✅       | Answers questions about your expenses                    |
| 📊 Analytics Dashboard    | ✅       | Charts for spending trends and categories                |
| 📄 Monthly Reports        | ✅       | Generates downloadable PDF reports                       |
| 🔔 Notifications          | Planned | Budget alerts and reminders                              |

---

# 🏗️ Tech Stack

## Frontend

* React + Vite
* Tailwind CSS
* Recharts
* Axios

## Backend

* FastAPI
* SQLAlchemy
* JWT Authentication
* bcrypt

## Database

* SQLite (development)
* PostgreSQL (production recommended)

## AI / ML

* scikit-learn
* TF-IDF + Logistic Regression
* Forecasting models
* Rule-based recommendations

## OCR

* Tesseract OCR
* pytesseract

## Optional AI

* OpenAI API integration

---

# 🏛️ Architecture

```
React (Vite)
      |
      | REST API + JWT
      |
FastAPI Backend
      |
      |
SQLite / PostgreSQL
      |
      +----------------+
      |                |
 Machine Learning   OCR Engine
      |
 AI Assistant
```

---

# ✨ AI Capabilities

## Expense Categorization

The application uses:

* TF-IDF text vectorization
* Logistic Regression classifier

Example:

```
"Uber ride downtown"
        ↓
Transportation
```

The model trains automatically from transaction examples and can be replaced with more advanced models such as transformers.

---

## Receipt OCR

Receipt images are processed using Tesseract OCR.

Extracted information:

* Merchant name
* Amount
* Date

The OCR pipeline can be upgraded with services such as Google Cloud Vision or other document AI models.

---

## Spending Forecast

Forecasting uses lightweight statistical methods:

* Moving averages
* Trend analysis

Designed for personal finance data where users typically have limited historical records.

---

## AI Financial Assistant

The assistant provides answers based on user transaction data.

Example:

```
User:
"How much did I spend on food this month?"

Assistant:
"You spent $240 on food this month,
which is 15% higher than your average."
```

Without an API key, the app uses a rule-based assistant.

With OpenAI configured, responses become more conversational.

---

# 📂 Project Structure

```
ai-expense-manager/

├── backend/
│
│── app/
│   ├── routers/
│   │   ├── auth.py
│   │   ├── expenses.py
│   │   ├── budget.py
│   │   ├── reports.py
│   │   └── assistant.py
│   │
│   ├── ml/
│   │   ├── category_classifier.py
│   │   ├── forecasting.py
│   │   ├── recommendation.py
│   │   └── ocr.py
│   │
│   ├── database.py
│   ├── models.py
│   └── config.py
│
├── frontend/
│
│── src/
│   ├── pages/
│   ├── components/
│   └── api.js
│
└── README.md
```

---

# ⚡ Installation

## 1. Clone Repository

```bash
git clone https://github.com/MHAMZA293/ai-expense-manager.git

cd ai-expense-manager
```

---

# Backend Setup

```bash
cd backend

python -m venv venv
```

Activate environment:

### Windows

```bash
venv\Scripts\activate
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create environment file:

```bash
cp .env.example .env
```

Configure your values:

```env
SECRET_KEY=your_random_secret_key

DATABASE_URL=sqlite:///./expense.db

OPENAI_API_KEY=
```

Start backend:

```bash
uvicorn main:app --reload
```

Backend:

```
http://localhost:8000
```

API documentation:

```
http://localhost:8000/docs
```

---

# Frontend Setup

```bash
cd frontend

npm install
```

Create environment file:

```bash
cp .env.example .env
```

Run:

```bash
npm run dev
```

Frontend:

```
http://localhost:5173
```

---

# 🐳 Docker Setup

Run the complete application:

```bash
docker compose up --build
```

---

# 🔐 Environment Variables

Never commit `.env` files.

Example:

```
backend/.env.example
frontend/.env.example
```

Required variables:

| Variable       | Purpose               |
| -------------- | --------------------- |
| SECRET_KEY     | JWT security key      |
| DATABASE_URL   | Database connection   |
| OPENAI_API_KEY | Optional AI assistant |

---

# 🛡️ Security

Before production deployment:

* Use a strong random `SECRET_KEY`
* Enable HTTPS
* Restrict CORS origins
* Use PostgreSQL instead of SQLite
* Store secrets outside Git
* Add rate limiting for authentication endpoints

---

# 🛣️ Roadmap

Future improvements:

* Email/browser notifications
* Voice expense entry
* Recurring expense detection
* Multi-user shared budgets
* Advanced AI financial coaching
* Better receipt understanding models
* Mobile application

---

# 📌 Project Status

This project is a portfolio-ready MVP demonstrating:

✅ Full-stack development
✅ AI/ML integration
✅ Secure authentication
✅ Data visualization
✅ OCR processing
✅ API architecture

---

# 👨‍💻 Author

**Muhammad Hamza**

GitHub:
https://github.com/MHAMZA293

---

⭐ If you find this project useful, consider giving it a star.
