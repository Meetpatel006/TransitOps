from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.permissions import Resource, require_permission
from app.database import get_db
from app.models.fleet import MaintenanceLog, Vehicle
from app.maintenance.schemas import MaintenanceCreate, MaintenanceUpdate

router = APIRouter(prefix="/api/maintenance", tags=["maintenance"])


@router.get("")
def list_maintenance(
    vehicle_id: int | None = None,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "read")),
):
    stmt = select(MaintenanceLog)
    if vehicle_id:
        stmt = stmt.where(MaintenanceLog.vehicle_id == vehicle_id)
    return db.scalars(stmt.order_by(MaintenanceLog.id)).all()


@router.get("/{log_id}")
def get_maintenance(
    log_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "read")),
):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    return log


@router.post("", status_code=201)
def create_maintenance(
    body: MaintenanceCreate,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "full")),
):
    vehicle = db.get(Vehicle, body.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    log = MaintenanceLog(vehicle_id=body.vehicle_id, title=body.title, description=body.description, cost=body.cost)
    db.add(log)
    vehicle.status = "In Shop"
    db.commit()
    db.refresh(log)
    return log


@router.put("/{log_id}")
def update_maintenance(
    log_id: int,
    body: MaintenanceUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "full")),
):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(log, field, value)
    if body.status == "Closed" and log.end_date is None:
        log.end_date = datetime.now(timezone.utc)
        vehicle = db.get(Vehicle, log.vehicle_id)
        if vehicle.status != "Retired":
            vehicle.status = "Available"
    db.commit()
    db.refresh(log)
    return log


@router.delete("/{log_id}", status_code=204)
def delete_maintenance(
    log_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "full")),
):
    log = db.get(MaintenanceLog, log_id)
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    db.delete(log)
    db.commit()
