from datetime import date

from pydantic import BaseModel


class DriverOut(BaseModel):
    id: int
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: float | None = None
    status: str


class DriverCreate(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry_date: date
    contact_number: str
    safety_score: float | None = None


class DriverUpdate(BaseModel):
    name: str | None = None
    license_number: str | None = None
    license_category: str | None = None
    license_expiry_date: date | None = None
    contact_number: str | None = None
    safety_score: float | None = None
    status: str | None = None
