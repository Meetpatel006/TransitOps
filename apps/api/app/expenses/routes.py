from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.routes import get_current_user
from app.database import get_db
from app.expenses.schemas import ExpenseCreate, ExpenseUpdate
from app.models.fleet import Expense, Vehicle

router = APIRouter(prefix="/api/expenses", tags=["expenses"])


@router.get("")
def list_expenses(
    vehicle_id: int | None = None,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    stmt = select(Expense)
    if vehicle_id:
        stmt = stmt.where(Expense.vehicle_id == vehicle_id)
    return db.scalars(stmt.order_by(Expense.id)).all()


@router.get("/{expense_id}")
def get_expense(
    expense_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    expense = db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense


@router.post("", status_code=201)
def create_expense(
    body: ExpenseCreate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    if not db.get(Vehicle, body.vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    expense = Expense(**body.model_dump())
    db.add(expense)
    db.commit()
    db.refresh(expense)
    return expense


@router.put("/{expense_id}")
def update_expense(
    expense_id: int,
    body: ExpenseUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    expense = db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(expense, field, value)
    db.commit()
    db.refresh(expense)
    return expense


@router.delete("/{expense_id}", status_code=204)
def delete_expense(
    expense_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    expense = db.get(Expense, expense_id)
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(expense)
    db.commit()
