from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.permissions import Resource, require_permission
from app.database import get_db
from app.drivers.schemas import DriverCreate, DriverUpdate
from app.models.fleet import Driver

router = APIRouter(prefix="/api/drivers", tags=["drivers"])


@router.get("")
def list_drivers(
    status_filter: str | None = None,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.DRIVERS, "read")),
):
    stmt = select(Driver)
    if status_filter:
        stmt = stmt.where(Driver.status == status_filter)
    return db.scalars(stmt.order_by(Driver.id)).all()


@router.get("/{driver_id}")
def get_driver(
    driver_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.DRIVERS, "read")),
):
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver


@router.post("", status_code=201)
def create_driver(
    body: DriverCreate,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.DRIVERS, "full")),
):
    existing = db.scalar(select(Driver).where(Driver.license_number == body.license_number))
    if existing:
        raise HTTPException(status_code=409, detail="License number already exists")
    driver = Driver(**body.model_dump())
    db.add(driver)
    db.commit()
    db.refresh(driver)
    return driver


@router.put("/{driver_id}")
def update_driver(
    driver_id: int,
    body: DriverUpdate,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.DRIVERS, "full")),
):
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    if body.license_number is not None and body.license_number != driver.license_number:
        existing = db.scalar(select(Driver).where(Driver.license_number == body.license_number))
        if existing:
            raise HTTPException(status_code=409, detail="License number already exists")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(driver, field, value)
    db.commit()
    db.refresh(driver)
    return driver


@router.delete("/{driver_id}", status_code=204)
def delete_driver(
    driver_id: int,
    db: DBSession = Depends(get_db),
    _=Depends(require_permission(Resource.DRIVERS, "full")),
):
    driver = db.get(Driver, driver_id)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    db.delete(driver)
    db.commit()
