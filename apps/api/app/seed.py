import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models.auth import Role, User
from app.models.fleet import Driver, Expense, FuelLog, MaintenanceLog, Trip, Vehicle
from app.auth.service import hash_password

ROLES = ["Admin", "Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"]

USERS = [
    {"email": "admin@transitops.com", "name": "Alice Admin", "role": "Admin", "password": "admin123"},
    {"email": "fleet@transitops.com", "name": "Frank Fleet", "role": "Fleet Manager", "password": "fleet123"},
    {"email": "driver@transitops.com", "name": "Diana Driver", "role": "Driver", "password": "driver123"},
    {"email": "safety@transitops.com", "name": "Sam Safety", "role": "Safety Officer", "password": "safety123"},
    {"email": "finance@transitops.com", "name": "Finn Finance", "role": "Financial Analyst", "password": "finance123"},
    {"email": "driver2@transitops.com", "name": "Eve Transporter", "role": "Driver", "password": "driver123"},
    {"email": "driver3@transitops.com", "name": "Jack Hauler", "role": "Driver", "password": "driver123"},
    {"email": "manager2@transitops.com", "name": "Grace Logistics", "role": "Fleet Manager", "password": "fleet123"},
    {"email": "safety2@transitops.com", "name": "Hank Inspector", "role": "Safety Officer", "password": "safety123"},
    {"email": "analyst2@transitops.com", "name": "Ivy Numbers", "role": "Financial Analyst", "password": "finance123"},
]

VEHICLES = [
    {"registration_number": "TR-1001", "name_model": "Volvo FH16", "type": "Truck", "maximum_load_capacity": 18000, "odometer": 45230, "acquisition_cost": 180000, "status": "Available"},
    {"registration_number": "TR-1002", "name_model": "Scania R500", "type": "Truck", "maximum_load_capacity": 20000, "odometer": 28900, "acquisition_cost": 195000, "status": "Available"},
    {"registration_number": "VN-2001", "name_model": "Ford Transit 350", "type": "Van", "maximum_load_capacity": 1500, "odometer": 32100, "acquisition_cost": 45000, "status": "On Trip"},
    {"registration_number": "VN-2002", "name_model": "Mercedes Sprinter", "type": "Van", "maximum_load_capacity": 1200, "odometer": 56780, "acquisition_cost": 52000, "status": "In Shop"},
    {"registration_number": "BS-3001", "name_model": "Toyota Coaster", "type": "Bus", "maximum_load_capacity": 3000, "odometer": 89340, "acquisition_cost": 85000, "status": "Available"},
    {"registration_number": "TR-1003", "name_model": "DAF XF 530", "type": "Truck", "maximum_load_capacity": 22000, "odometer": 12450, "acquisition_cost": 210000, "status": "Retired"},
    {"registration_number": "VN-2003", "name_model": "Renault Kangoo", "type": "Van", "maximum_load_capacity": 800, "odometer": 73450, "acquisition_cost": 28000, "status": "Available"},
    {"registration_number": "TR-1004", "name_model": "MAN TGX 18.510", "type": "Truck", "maximum_load_capacity": 24000, "odometer": 6700, "acquisition_cost": 225000, "status": "Available"},
]

DRIVERS = [
    {"name": "Carlos Mendez", "license_number": "LIC-A001", "license_category": "C", "license_expiry_date": date(2027, 6, 15), "contact_number": "+1-555-0101", "safety_score": 92, "status": "Available"},
    {"name": "Maria Santos", "license_number": "LIC-A002", "license_category": "C", "license_expiry_date": date(2028, 3, 22), "contact_number": "+1-555-0102", "safety_score": 88, "status": "On Trip"},
    {"name": "Wei Chen", "license_number": "LIC-A003", "license_category": "B", "license_expiry_date": date(2026, 11, 10), "contact_number": "+1-555-0103", "safety_score": 75, "status": "Available"},
    {"name": "Priya Sharma", "license_number": "LIC-A004", "license_category": "D", "license_expiry_date": date(2027, 9, 5), "contact_number": "+1-555-0104", "safety_score": 95, "status": "Off Duty"},
    {"name": "John O'Brien", "license_number": "LIC-A005", "license_category": "C", "license_expiry_date": date(2025, 1, 20), "contact_number": "+1-555-0105", "safety_score": 60, "status": "Suspended"},
    {"name": "Fatima Al-Rashid", "license_number": "LIC-A006", "license_category": "B", "license_expiry_date": date(2028, 7, 30), "contact_number": "+1-555-0106", "safety_score": 91, "status": "Available"},
    {"name": "Kwame Asante", "license_number": "LIC-A007", "license_category": "C", "license_expiry_date": date(2029, 2, 14), "contact_number": "+1-555-0107", "safety_score": 84, "status": "Available"},
    {"name": "Sofia Rossi", "license_number": "LIC-A008", "license_category": "D", "license_expiry_date": date(2027, 12, 1), "contact_number": "+1-555-0108", "safety_score": 79, "status": "Available"},
]

TRIPS = [
    {"source": "New York, NY", "destination": "Boston, MA", "cargo_weight": 12000, "planned_distance": 215, "status": "Draft"},
    {"source": "Chicago, IL", "destination": "Detroit, MI", "cargo_weight": 8000, "planned_distance": 283, "status": "Dispatched"},
    {"source": "Los Angeles, CA", "destination": "San Francisco, CA", "cargo_weight": 500, "planned_distance": 383, "status": "Completed", "final_odometer": 89720, "fuel_consumed": 42.3},
    {"source": "Dallas, TX", "destination": "Houston, TX", "cargo_weight": 15000, "planned_distance": 239, "status": "Completed", "final_odometer": 45680, "fuel_consumed": 38.7},
    {"source": "Miami, FL", "destination": "Orlando, FL", "cargo_weight": 2000, "planned_distance": 236, "status": "Cancelled"},
    {"source": "Seattle, WA", "destination": "Portland, OR", "cargo_weight": 600, "planned_distance": 173, "status": "Draft"},
    {"source": "Denver, CO", "destination": "Salt Lake City, UT", "cargo_weight": 18000, "planned_distance": 514, "status": "Cancelled"},
    {"source": "Atlanta, GA", "destination": "Nashville, TN", "cargo_weight": 9000, "planned_distance": 249, "status": "Completed", "final_odometer": 12560, "fuel_consumed": 31.2},
]

MAINTENANCE_LOGS = [
    {"title": "Oil change", "description": "Regular 10,000 km oil change", "status": "Closed", "days_ago": 30, "closed": True},
    {"title": "Brake inspection", "description": "Front brake pads replacement", "status": "Closed", "days_ago": 15, "closed": True},
    {"title": "Engine tune-up", "description": "Check engine light diagnostic and repair", "status": "Open", "days_ago": 2, "closed": False},
    {"title": "Tire rotation", "description": "Rotate and balance all four tires", "status": "Open", "days_ago": 0, "closed": False},
]

FUEL_LOGS = [
    {"liters": 120, "cost": 216.00, "days_ago": 1},
    {"liters": 95, "cost": 171.00, "days_ago": 3},
    {"liters": 140, "cost": 252.00, "days_ago": 5},
    {"liters": 80, "cost": 144.00, "days_ago": 7},
    {"liters": 110, "cost": 198.00, "days_ago": 10},
    {"liters": 130, "cost": 234.00, "days_ago": 14},
]

EXPENSES = [
    {"cost": 450.00, "category": "Repairs", "notes": "Windshield replacement", "days_ago": 2},
    {"cost": 120.00, "category": "Tolls", "notes": "NJT Turnpike tolls", "days_ago": 4},
    {"cost": 85.00, "category": "Cleaning", "notes": "Interior deep clean", "days_ago": 6},
    {"cost": 600.00, "category": "Insurance", "notes": "Monthly premium", "days_ago": 12},
    {"cost": 200.00, "category": "Permits", "notes": "Annual operating permit", "days_ago": 20},
    {"cost": 350.00, "category": "Repairs", "notes": "AC compressor fix", "days_ago": 8},
    {"cost": 75.00, "category": "Supplies", "notes": "Tie-down straps", "days_ago": 3},
    {"cost": 150.00, "category": "Parking", "notes": "Lot fees - Chicago terminal", "days_ago": 1},
]


def seed():
    db = SessionLocal()
    try:
        role_map = {}
        for name in ROLES:
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name)
                db.add(role)
                db.flush()
            role_map[name] = role.id

        now = datetime.now(timezone.utc)

        for u in USERS:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if existing:
                existing.role_id = role_map[u["role"]]
            else:
                db.add(User(
                    email=u["email"],
                    name=u["name"],
                    role_id=role_map[u["role"]],
                    hashed_password=hash_password(u["password"]),
                ))
        db.flush()

        vehicle_map = {}
        for v in VEHICLES:
            existing = db.query(Vehicle).filter(Vehicle.registration_number == v["registration_number"]).first()
            if not existing:
                existing = Vehicle(**v)
                db.add(existing)
                db.flush()
            vehicle_map[existing.registration_number] = existing.id

        driver_map = {}
        for d in DRIVERS:
            existing = db.query(Driver).filter(Driver.license_number == d["license_number"]).first()
            if not existing:
                existing = Driver(**d)
                db.add(existing)
                db.flush()
            driver_map[existing.license_number] = existing.id

        trip_vehicles = list(vehicle_map.values())
        trip_drivers = list(driver_map.values())
        for i, t in enumerate(TRIPS):
            existing = db.query(Trip).filter(
                Trip.source == t["source"], Trip.destination == t["destination"], Trip.status == t["status"]
            ).first()
            if not existing:
                existing = Trip(
                    source=t["source"],
                    destination=t["destination"],
                    vehicle_id=trip_vehicles[i % len(trip_vehicles)],
                    driver_id=trip_drivers[i % len(trip_drivers)],
                    cargo_weight=t["cargo_weight"],
                    planned_distance=t["planned_distance"],
                    status=t["status"],
                    final_odometer=t.get("final_odometer"),
                    fuel_consumed=t.get("fuel_consumed"),
                )
                db.add(existing)
        db.flush()

        maint_vehicles = list(vehicle_map.values())
        for i, m in enumerate(MAINTENANCE_LOGS):
            existing = db.query(MaintenanceLog).filter(
                MaintenanceLog.title == m["title"]
            ).first()
            if not existing:
                start = now - timedelta(days=m["days_ago"] + (5 if m["closed"] else 0))
                existing = MaintenanceLog(
                    vehicle_id=maint_vehicles[i % len(maint_vehicles)],
                    title=m["title"],
                    description=m["description"],
                    status=m["status"],
                    start_date=start,
                    end_date=start + timedelta(days=m["days_ago"]) if m["closed"] else None,
                )
                db.add(existing)
        db.flush()

        fuel_vehicles = list(vehicle_map.values())
        for i, f in enumerate(FUEL_LOGS):
            existing = db.query(FuelLog).filter(
                FuelLog.date == (now - timedelta(days=f["days_ago"])).date(),
                FuelLog.vehicle_id == fuel_vehicles[i % len(fuel_vehicles)],
            ).first()
            if not existing:
                existing = FuelLog(
                    vehicle_id=fuel_vehicles[i % len(fuel_vehicles)],
                    liters=f["liters"],
                    cost=f["cost"],
                    date=(now - timedelta(days=f["days_ago"])).date(),
                )
                db.add(existing)
        db.flush()

        expense_vehicles = list(vehicle_map.values())
        for i, e in enumerate(EXPENSES):
            existing = db.query(Expense).filter(
                Expense.notes == e["notes"]
            ).first()
            if not existing:
                existing = Expense(
                    vehicle_id=expense_vehicles[i % len(expense_vehicles)],
                    cost=e["cost"],
                    date=(now - timedelta(days=e["days_ago"])).date(),
                    category=e["category"],
                    notes=e["notes"],
                )
                db.add(existing)
        db.flush()

        db.commit()
        print(f"Seed complete: {len(USERS)} users, {len(VEHICLES)} vehicles, {len(DRIVERS)} drivers, {len(TRIPS)} trips, {len(MAINTENANCE_LOGS)} maintenance, {len(FUEL_LOGS)} fuel logs, {len(EXPENSES)} expenses")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
