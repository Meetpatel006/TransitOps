import datetime as _dt

from pydantic import BaseModel


class FuelLogOut(BaseModel):
    id: int
    vehicle_id: int
    liters: float
    cost: float
    date: _dt.date


class FuelLogCreate(BaseModel):
    vehicle_id: int
    liters: float
    cost: float
    date: _dt.date


class FuelLogUpdate(BaseModel):
    liters: float | None = None
    cost: float | None = None
    date: _dt.date | None = None
