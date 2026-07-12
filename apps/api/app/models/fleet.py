from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True)
    registration_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    name_model: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[str] = mapped_column(String(100), nullable=False)
    maximum_load_capacity: Mapped[float] = mapped_column(Float, nullable=False)
    odometer: Mapped[float] = mapped_column(Float, default=0.0)
    acquisition_cost: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="Available")

    trips: Mapped[list["Trip"]] = relationship(back_populates="vehicle")
    maintenance_logs: Mapped[list["MaintenanceLog"]] = relationship(back_populates="vehicle")
    fuel_logs: Mapped[list["FuelLog"]] = relationship(back_populates="vehicle")
    expenses: Mapped[list["Expense"]] = relationship(back_populates="vehicle")


class Driver(Base):
    __tablename__ = "drivers"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    license_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False
    )
    license_category: Mapped[str] = mapped_column(String(50), nullable=False)
    license_expiry_date: Mapped[date] = mapped_column(Date, nullable=False)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=False)
    safety_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Available")

    trips: Mapped[list["Trip"]] = relationship(back_populates="driver")


class Trip(Base):
    __tablename__ = "trips"

    id: Mapped[int] = mapped_column(primary_key=True)
    source: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    driver_id: Mapped[int] = mapped_column(ForeignKey("drivers.id"), nullable=False)
    cargo_weight: Mapped[float] = mapped_column(Float, nullable=False)
    planned_distance: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="Draft")
    final_odometer: Mapped[float | None] = mapped_column(Float, nullable=True)
    fuel_consumed: Mapped[float | None] = mapped_column(Float, nullable=True)

    vehicle: Mapped[Vehicle] = relationship(back_populates="trips")
    driver: Mapped[Driver] = relationship(back_populates="trips")


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    end_date: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

    vehicle: Mapped[Vehicle] = relationship(back_populates="maintenance_logs")


class FuelLog(Base):
    __tablename__ = "fuel_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    liters: Mapped[float] = mapped_column(Float, nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)

    vehicle: Mapped[Vehicle] = relationship(back_populates="fuel_logs")


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    vehicle: Mapped[Vehicle] = relationship(back_populates="expenses")
