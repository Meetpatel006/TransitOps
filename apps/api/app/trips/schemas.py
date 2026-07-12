from datetime import date, datetime

from pydantic import BaseModel


class TripOut(BaseModel):
    id: int
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float
    status: str
    final_odometer: float | None = None
    fuel_consumed: float | None = None


class TripCreate(BaseModel):
    source: str
    destination: str
    vehicle_id: int
    driver_id: int
    cargo_weight: float
    planned_distance: float


class TripUpdate(BaseModel):
    source: str | None = None
    destination: str | None = None
    vehicle_id: int | None = None
    driver_id: int | None = None
    cargo_weight: float | None = None
    planned_distance: float | None = None


class TripComplete(BaseModel):
    final_odometer: float
    fuel_consumed: float
