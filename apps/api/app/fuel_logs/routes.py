from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.routes import get_current_user
from app.database import get_db
from app.fuel_logs.schemas import FuelLogCreate, FuelLogUpdate
from app.models.fleet import FuelLog, Vehicle

router = APIRouter(prefix="/api/fuel-logs", tags=["fuel-logs"])


@router.get("")
def list_fuel_logs(
    vehicle_id: int | None = None,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    stmt = select(FuelLog)
    if vehicle_id:
        stmt = stmt.where(FuelLog.vehicle_id == vehicle_id)
    return db.scalars(stmt.order_by(FuelLog.id)).all()


@router.get("/{log_id}")
def get_fuel_log(
    log_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    log = db.get(FuelLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    return log


@router.post("", status_code=201)
def create_fuel_log(
    body: FuelLogCreate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    if not db.get(Vehicle, body.vehicle_id):
        raise HTTPException(status_code=404, detail="Vehicle not found")
    log = FuelLog(**body.model_dump())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


@router.put("/{log_id}")
def update_fuel_log(
    log_id: int,
    body: FuelLogUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    log = db.get(FuelLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(log, field, value)
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=204)
def delete_fuel_log(
    log_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    log = db.get(FuelLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    db.delete(log)
    db.commit()
