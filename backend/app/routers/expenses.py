"""
Expense CRUD + AI categorization + receipt upload/OCR.
"""
import os
import shutil
import uuid
from datetime import date as date_type
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session

from app import models, schemas
from app.auth import get_current_user
from app.database import get_db
from app.ml.category_classifier import classifier
from app.ml.ocr import extract_receipt_data

router = APIRouter(prefix="/expenses", tags=["expenses"])

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "receipts")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("", response_model=schemas.ExpenseOut, status_code=201)
def create_expense(
    payload: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    category = payload.category
    if not category:
        category = classifier.predict(payload.description)  # AI auto-categorization

    expense = models.Expense(
        user_id=user.id,
        description=payload.description,
        amount=payload.amount,
        type=payload.type,
        category=category,
        date=payload.date or date_type.today(),
    )
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.get("", response_model=List[schemas.ExpenseOut])
def list_expenses(
    start_date: Optional[date_type] = None,
    end_date: Optional[date_type] = None,
    category: Optional[str] = None,
    search: Optional[str] = Query(None, description="Search in description"),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    q = db.query(models.Expense).filter(models.Expense.user_id == user.id)
    if start_date:
        q = q.filter(models.Expense.date >= start_date)
    if end_date:
        q = q.filter(models.Expense.date <= end_date)
    if category:
        q = q.filter(models.Expense.category == category)
    if search:
        q = q.filter(models.Expense.description.ilike(f"%{search}%"))
    return q.order_by(models.Expense.date.desc()).all()


@router.put("/{expense_id}", response_model=schemas.ExpenseOut)
def update_expense(
    expense_id: int,
    payload: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id, models.Expense.user_id == user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)

    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    expense = db.query(models.Expense).filter(
        models.Expense.id == expense_id, models.Expense.user_id == user.id
    ).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()


@router.post("/categorize-preview")
def categorize_preview(description: str, user: models.User = Depends(get_current_user)):
    """Lets the frontend show a live AI category suggestion as the user types."""
    top = classifier.predict_proba(description)[:3]
    return {"suggestions": [{"category": c, "confidence": round(float(p), 3)} for c, p in top]}


@router.post("/receipt-scan")
def scan_receipt(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: models.User = Depends(get_current_user),
):
    """
    Uploads a receipt image, runs OCR, and returns extracted fields
    (store name, amount, date) plus an AI-predicted category — the
    frontend then lets the user confirm/edit before saving as an expense.
    """
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"{user.id}_{uuid.uuid4().hex}{ext}"
    save_path = os.path.join(UPLOAD_DIR, filename)

    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    result = extract_receipt_data(save_path)
    store = result.get("store_name") or ""
    result["suggested_category"] = classifier.predict(store) if store else "Other"
    result["receipt_path"] = f"uploads/receipts/{filename}"
    return result
