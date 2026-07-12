from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.permissions import Resource, require_permission
from app.database import get_db
from app.models.fleet import (
    Driver,
    Expense,
    FuelLog,
    MaintenanceLog,
    Trip,
    Vehicle,
)

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("")
def analytics(
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.ANALYTICS, "read")),
):
    # Analytics is its own resource grant: aggregated data is served to any
    # role with ANALYTICS access, regardless of per-resource limits.
    return {
        "vehicles": db.scalars(select(Vehicle)).all(),
        "drivers": db.scalars(select(Driver)).all(),
        "trips": db.scalars(select(Trip)).all(),
        "maintenance": db.scalars(select(MaintenanceLog)).all(),
        "fuel_logs": db.scalars(select(FuelLog)).all(),
        "expenses": db.scalars(select(Expense)).all(),
    }
