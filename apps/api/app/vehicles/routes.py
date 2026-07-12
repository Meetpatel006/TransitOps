from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.permissions import Resource, require_permission
from app.database import get_db
from app.models.fleet import Vehicle
from app.vehicles.schemas import VehicleCreate, VehicleOut, VehicleUpdate

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])


@router.get("")
def list_vehicles(
    status_filter: str | None = None,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "read")),
):
    stmt = select(Vehicle)
    if status_filter:
        stmt = stmt.where(Vehicle.status == status_filter)
    return db.scalars(stmt.order_by(Vehicle.id)).all()


@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "read")),
):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return vehicle


@router.post("", status_code=201)
def create_vehicle(
    body: VehicleCreate,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "full")),
):
    existing = db.scalar(select(Vehicle).where(Vehicle.registration_number == body.registration_number))
    if existing:
        raise HTTPException(status_code=409, detail="Registration number already exists")
    vehicle = Vehicle(**body.model_dump())
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    body: VehicleUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "full")),
):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    if body.registration_number is not None and body.registration_number != vehicle.registration_number:
        existing = db.scalar(select(Vehicle).where(Vehicle.registration_number == body.registration_number))
        if existing:
            raise HTTPException(status_code=409, detail="Registration number already exists")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(vehicle, field, value)
    db.commit()
    db.refresh(vehicle)
    return vehicle


@router.delete("/{vehicle_id}", status_code=204)
def delete_vehicle(
    vehicle_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.FLEET, "full")),
):
    vehicle = db.get(Vehicle, vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    db.delete(vehicle)
    db.commit()
