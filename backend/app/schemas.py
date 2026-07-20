"""
Pydantic request/response schemas.
"""
from datetime import date, datetime
from typing import Optional, List

from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth / User ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    email: EmailStr
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Expense ----------
class ExpenseCreate(BaseModel):
    description: str
    amount: float
    type: str = "expense"          # "expense" | "income"
    category: Optional[str] = None  # if omitted, AI predicts it
    date: Optional[date] = None


class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    type: Optional[str] = None
    category: Optional[str] = None
    date: Optional[date] = None


class ExpenseOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    description: str
    amount: float
    type: str
    category: Optional[str]
    date: date
    receipt_path: Optional[str] = None


# ---------- Budget ----------
class BudgetCreate(BaseModel):
    month: str                       # "2026-07"
    limit_amount: float
    category: Optional[str] = None


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    month: str
    limit_amount: float
    category: Optional[str]


# ---------- Assistant ----------
class AssistantQuery(BaseModel):
    question: str


class AssistantAnswer(BaseModel):
    answer: str
    data: Optional[dict] = None
