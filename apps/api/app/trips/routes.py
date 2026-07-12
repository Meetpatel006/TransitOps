from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.routes import get_current_user
from app.database import get_db
from app.models.fleet import Driver, Trip, Vehicle
from app.trips.schemas import TripComplete, TripCreate, TripUpdate

router = APIRouter(prefix="/api/trips", tags=["trips"])


@router.get("")
def list_trips(
    status_filter: str | None = None,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    stmt = select(Trip)
    if status_filter:
        stmt = stmt.where(Trip.status == status_filter)
    return db.scalars(stmt.order_by(Trip.id)).all()


@router.get("/{trip_id}")
def get_trip(
    trip_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    return trip


@router.post("", status_code=201)
def create_trip(
    body: TripCreate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    vehicle = db.get(Vehicle, body.vehicle_id)
    if not vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    driver = db.get(Driver, body.driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if body.cargo_weight > vehicle.maximum_load_capacity:
        raise HTTPException(status_code=400, detail="Cargo weight exceeds vehicle max load capacity")
    trip = Trip(**body.model_dump())
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip


@router.put("/{trip_id}")
def update_trip(
    trip_id: int,
    body: TripUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != "Draft":
        raise HTTPException(status_code=400, detail="Only draft trips can be edited")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(trip, field, value)
    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/dispatch")
def dispatch_trip(
    trip_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != "Draft":
        raise HTTPException(status_code=400, detail="Only draft trips can be dispatched")

    vehicle = db.get(Vehicle, trip.vehicle_id)
    if vehicle.status in ("Retired", "In Shop"):
        raise HTTPException(status_code=400, detail="Vehicle is not available for dispatch")
    if vehicle.status == "On Trip":
        raise HTTPException(status_code=400, detail="Vehicle is already on a trip")

    driver = db.get(Driver, trip.driver_id)
    if driver.status == "Suspended":
        raise HTTPException(status_code=400, detail="Driver is suspended")
    if driver.status == "On Trip":
        raise HTTPException(status_code=400, detail="Driver is already on a trip")
    if driver.license_expiry_date < date.today():
        raise HTTPException(status_code=400, detail="Driver license has expired")

    vehicle.status = "On Trip"
    driver.status = "On Trip"
    trip.status = "Dispatched"
    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/complete")
def complete_trip(
    trip_id: int,
    body: TripComplete,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status != "Dispatched":
        raise HTTPException(status_code=400, detail="Only dispatched trips can be completed")

    vehicle = db.get(Vehicle, trip.vehicle_id)
    driver = db.get(Driver, trip.driver_id)

    trip.final_odometer = body.final_odometer
    trip.fuel_consumed = body.fuel_consumed
    trip.status = "Completed"
    vehicle.status = "Available"
    driver.status = "Available"
    db.commit()
    db.refresh(trip)
    return trip


@router.post("/{trip_id}/cancel")
def cancel_trip(
    trip_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(get_current_user),
):
    trip = db.get(Trip, trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.status not in ("Draft", "Dispatched"):
        raise HTTPException(status_code=400, detail="Only draft or dispatched trips can be cancelled")

    if trip.status == "Dispatched":
        vehicle = db.get(Vehicle, trip.vehicle_id)
        driver = db.get(Driver, trip.driver_id)
        vehicle.status = "Available"
        driver.status = "Available"

    trip.status = "Cancelled"
    db.commit()
    db.refresh(trip)
    return trip
