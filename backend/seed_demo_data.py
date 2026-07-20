"""
Optional helper: populates the database with a demo user + a few months
of sample transactions, so the dashboard/charts/forecast have something
to show immediately after cloning the project.

Run:
    python seed_demo_data.py
"""
import random
from datetime import date, timedelta

from app.database import SessionLocal, Base, engine
from app import models
from app.auth import hash_password

Base.metadata.create_all(bind=engine)

SAMPLE_EXPENSES = [
    ("McDonald's", "Food", 12), ("Starbucks coffee", "Food", 6), ("Uber ride", "Transport", 15),
    ("Amazon order", "Shopping", 45), ("electricity bill", "Bills", 60), ("movie tickets", "Entertainment", 20),
    ("grocery store", "Groceries", 55), ("gym membership", "Health", 30), ("Netflix subscription", "Bills", 15),
    ("KFC dinner", "Food", 18), ("fuel petrol", "Transport", 40), ("clothing store", "Shopping", 70),
]


def run():
    db = SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == "demo@example.com").first()
        if not user:
            user = models.User(name="Demo User", email="demo@example.com", hashed_password=hash_password("demo1234"))
            db.add(user)
            db.commit()
            db.refresh(user)
            print("Created demo user: demo@example.com / demo1234")

        today = date.today()
        for months_ago in range(3, -1, -1):
            month_date = (today.replace(day=1) - timedelta(days=1)) if months_ago else today
            for _ in range(10):
                desc, cat, base_amount = random.choice(SAMPLE_EXPENSES)
                amount = round(base_amount * random.uniform(0.7, 1.4), 2)
                d = today.replace(day=min(28, max(1, today.day))) - timedelta(days=months_ago * 30 + random.randint(0, 27))
                db.add(models.Expense(user_id=user.id, description=desc, amount=amount,
                                       type="expense", category=cat, date=d))
            db.add(models.Expense(user_id=user.id, description="Monthly salary", amount=2500,
                                   type="income", category="Salary",
                                   date=today - timedelta(days=months_ago * 30)))
        db.commit()
        print("Seeded demo transactions.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
