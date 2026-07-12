from datetime import datetime

from pydantic import BaseModel


class MaintenanceOut(BaseModel):
    id: int
    vehicle_id: int
    title: str
    description: str | None = None
    status: str
    start_date: datetime
    end_date: datetime | None = None


class MaintenanceCreate(BaseModel):
    vehicle_id: int
    title: str
    description: str | None = None


class MaintenanceUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
