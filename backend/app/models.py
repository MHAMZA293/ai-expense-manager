"""
SQLAlchemy ORM models: User, Expense, Budget.
"""
from datetime import date, datetime

from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    expenses = relationship("Expense", back_populates="owner", cascade="all, delete-orphan")
    budgets = relationship("Budget", back_populates="owner", cascade="all, delete-orphan")


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)          # positive = expense, negative = income (or use type)
    type = Column(String, default="expense")          # "expense" | "income"
    category = Column(String, nullable=True, index=True)
    date = Column(Date, default=date.today, index=True)
    receipt_path = Column(String, nullable=True)

    owner = relationship("User", back_populates="expenses")


class Budget(Base):
    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    month = Column(String, nullable=False)   # "2026-07"
    limit_amount = Column(Float, nullable=False)
    category = Column(String, nullable=True)  # null = overall budget

    owner = relationship("User", back_populates="budgets")
