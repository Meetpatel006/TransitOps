import datetime as _dt

from pydantic import BaseModel


class ExpenseOut(BaseModel):
    id: int
    vehicle_id: int
    cost: float
    date: _dt.date
    category: str
    notes: str | None = None


class ExpenseCreate(BaseModel):
    vehicle_id: int
    cost: float
    date: _dt.date
    category: str
    notes: str | None = None


class ExpenseUpdate(BaseModel):
    cost: float | None = None
    date: _dt.date | None = None
    category: str | None = None
    notes: str | None = None
