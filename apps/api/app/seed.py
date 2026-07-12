import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models.auth import Role, User
from app.models.fleet import Driver, Expense, FuelLog, MaintenanceLog, Trip, Vehicle
from app.auth.service import hash_password

ROLES = ["Admin", "Fleet Manager", "Dispatcher", "Driver", "Safety Officer", "Financial Analyst"]

USERS = [
    {"email": "admin@transitops.com", "name": "Alice Admin", "role": "Admin", "password": "admin123"},
    {"email": "fleet@transitops.com", "name": "Frank Fleet", "role": "Fleet Manager", "password": "fleet123"},
    {"email": "driver@transitops.com", "name": "Alex", "role": "Driver", "password": "driver123"},
    {"email": "driver2@transitops.com", "name": "Priya", "role": "Driver", "password": "driver123"},
    {"email": "driver3@transitops.com", "name": "Suresh", "role": "Driver", "password": "driver123"},
    {"email": "safety@transitops.com", "name": "Sam Safety", "role": "Safety Officer", "password": "safety123"},
    {"email": "finance@transitops.com", "name": "Finn Finance", "role": "Financial Analyst", "password": "finance123"},
    {"email": "manager2@transitops.com", "name": "Grace Logistics", "role": "Fleet Manager", "password": "fleet123"},
    {"email": "dispatch@transitops.com", "name": "Dee Dispatcher", "role": "Dispatcher", "password": "dispatch123"},
]

VEHICLES = [
    {"registration_number": "GJ01AB4521", "name_model": "VAN-05", "type": "Van", "maximum_load_capacity": 500, "odometer": 74000, "acquisition_cost": 620000, "status": "Available"},
    {"registration_number": "GJ01AB9981", "name_model": "TRUCK-12", "type": "Truck", "maximum_load_capacity": 5000, "odometer": 182000, "acquisition_cost": 2450000, "status": "On Trip"},
    {"registration_number": "GJ01AB1120", "name_model": "MINI-08", "type": "Mini", "maximum_load_capacity": 1000, "odometer": 66000, "acquisition_cost": 410000, "status": "In Shop"},
    {"registration_number": "GJ01AB0008", "name_model": "VAN-09", "type": "Van", "maximum_load_capacity": 750, "odometer": 241900, "acquisition_cost": 590000, "status": "Retired"},
]

DRIVERS = [
    {"name": "Alex", "license_number": "DL-88213", "license_category": "LMV", "license_expiry_date": date(2028, 12, 1), "contact_number": "98765xxxxx", "safety_score": 96, "status": "Available"},
    {"name": "John", "license_number": "DL-44120", "license_category": "HMV", "license_expiry_date": date(2025, 3, 1), "contact_number": "98220xxxxx", "safety_score": 91, "status": "Suspended"},
    {"name": "Priya", "license_number": "DL-77031", "license_category": "LMV", "license_expiry_date": date(2027, 8, 1), "contact_number": "99110xxxxx", "safety_score": 99, "status": "On Trip"},
    {"name": "Suresh", "license_number": "DL-90045", "license_category": "HMV", "license_expiry_date": date(2027, 1, 1), "contact_number": "97440xxxxx", "safety_score": 88, "status": "Off Duty"},
]

TRIPS = [
    {"source": "Gandhinagar Depot", "destination": "Ahmedabad Hub", "vehicle_idx": 0, "driver_idx": 0, "cargo_weight": 450, "planned_distance": 38, "status": "Dispatched"},
    {"source": "Vatva Industrial Area", "destination": "Sanand Warehouse", "vehicle_idx": 1, "driver_idx": 2, "cargo_weight": 2000, "planned_distance": 25, "status": "Draft"},
    {"source": "Mansa", "destination": "Kalol Depot", "vehicle_idx": 0, "driver_idx": 3, "cargo_weight": 300, "planned_distance": 55, "status": "Completed", "final_odometer": 74200, "fuel_consumed": 12.5},
    {"source": "Naroda", "destination": "Vastral", "vehicle_idx": 1, "driver_idx": 0, "cargo_weight": 1800, "planned_distance": 15, "status": "Cancelled"},
    {"source": "SG Highway", "destination": "Airport Cargo", "vehicle_idx": 0, "driver_idx": 2, "cargo_weight": 350, "planned_distance": 12, "status": "Dispatched"},
    {"source": "Ashram Road", "destination": "Satellite Depot", "vehicle_idx": 0, "driver_idx": 0, "cargo_weight": 200, "planned_distance": 8, "status": "Completed", "final_odometer": 74050, "fuel_consumed": 4.2},
    {"source": "Maninagar", "destination": "Vastral", "vehicle_idx": 1, "driver_idx": 2, "cargo_weight": 1500, "planned_distance": 10, "status": "Draft"},
]

MAINTENANCE_LOGS = [
    {"vehicle_idx": 0, "title": "Oil Change", "description": "Regular 10,000 km oil change", "cost": 2800, "status": "Closed", "days_ago": 7, "closed": True},
    {"vehicle_idx": 1, "title": "Engine Repair", "description": "Check engine light diagnostic and repair", "cost": 18000, "status": "Closed", "days_ago": 6, "closed": True},
    {"vehicle_idx": 2, "title": "Tyre Replace", "description": "Replace worn front tyres", "cost": 6200, "status": "Open", "days_ago": 6, "closed": False},
    {"vehicle_idx": 0, "title": "Brake Service", "description": "Front brake pads replacement", "cost": 1800, "status": "Closed", "days_ago": 4, "closed": True},
    {"vehicle_idx": 1, "title": "AC Service", "description": "AC compressor check and gas refill", "cost": 3500, "status": "Open", "days_ago": 3, "closed": False},
    {"vehicle_idx": 3, "title": "General Service", "description": "Full vehicle inspection and servicing", "cost": 4200, "status": "Closed", "days_ago": 2, "closed": True},
]

FUEL_LOGS = [
    {"vehicle_idx": 0, "liters": 42, "cost": 3150, "days_ago": 7},
    {"vehicle_idx": 1, "liters": 110, "cost": 8400, "days_ago": 6},
    {"vehicle_idx": 2, "liters": 28, "cost": 2050, "days_ago": 6},
    {"vehicle_idx": 0, "liters": 38, "cost": 2831, "days_ago": 4},
    {"vehicle_idx": 1, "liters": 95, "cost": 7315, "days_ago": 2},
]

EXPENSES = [
    {"vehicle_idx": 0, "cost": 120, "category": "Toll", "notes": "Gandhinagar-Ahmedabad toll", "days_ago": 7},
    {"vehicle_idx": 1, "cost": 340, "category": "Toll", "notes": "Vatva-Sanand toll", "days_ago": 6},
    {"vehicle_idx": 1, "cost": 150, "category": "Other", "notes": "Loading charges", "days_ago": 6},
    {"vehicle_idx": 0, "cost": 80, "category": "Toll", "notes": "Mansa-Kalol toll", "days_ago": 4},
    {"vehicle_idx": 2, "cost": 200, "category": "Other", "notes": "Parking fees", "days_ago": 3},
]


def seed():
    db = SessionLocal()
    try:
        # ponytail: clear child tables first to avoid FK violations, then parents
        for model in (FuelLog, Expense, MaintenanceLog, Trip, Driver, Vehicle):
            db.query(model).delete()
        db.query(User).delete()
        db.flush()

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

        vehicle_ids = []
        for v in VEHICLES:
            existing = db.query(Vehicle).filter(Vehicle.registration_number == v["registration_number"]).first()
            if not existing:
                existing = Vehicle(**v)
                db.add(existing)
                db.flush()
            vehicle_ids.append(existing.id)

        driver_ids = []
        for d in DRIVERS:
            existing = db.query(Driver).filter(Driver.license_number == d["license_number"]).first()
            if not existing:
                existing = Driver(**d)
                db.add(existing)
                db.flush()
            driver_ids.append(existing.id)

        for t in TRIPS:
            existing = db.query(Trip).filter(
                Trip.source == t["source"], Trip.destination == t["destination"], Trip.status == t["status"]
            ).first()
            if not existing:
                db.add(Trip(
                    source=t["source"],
                    destination=t["destination"],
                    vehicle_id=vehicle_ids[t["vehicle_idx"]],
                    driver_id=driver_ids[t["driver_idx"]],
                    cargo_weight=t["cargo_weight"],
                    planned_distance=t["planned_distance"],
                    status=t["status"],
                    final_odometer=t.get("final_odometer"),
                    fuel_consumed=t.get("fuel_consumed"),
                ))
        db.flush()

        for m in MAINTENANCE_LOGS:
            existing = db.query(MaintenanceLog).filter(
                MaintenanceLog.title == m["title"]
            ).first()
            if not existing:
                start = now - timedelta(days=m["days_ago"] + (5 if m["closed"] else 0))
                db.add(MaintenanceLog(
                    vehicle_id=vehicle_ids[m["vehicle_idx"]],
                    title=m["title"],
                    description=m["description"],
                    cost=m["cost"],
                    status=m["status"],
                    start_date=start,
                    end_date=start + timedelta(days=m["days_ago"]) if m["closed"] else None,
                ))
        db.flush()

        for f in FUEL_LOGS:
            existing = db.query(FuelLog).filter(
                FuelLog.date == (now - timedelta(days=f["days_ago"])).date(),
                FuelLog.vehicle_id == vehicle_ids[f["vehicle_idx"]],
            ).first()
            if not existing:
                db.add(FuelLog(
                    vehicle_id=vehicle_ids[f["vehicle_idx"]],
                    liters=f["liters"],
                    cost=f["cost"],
                    date=(now - timedelta(days=f["days_ago"])).date(),
                ))
        db.flush()

        for e in EXPENSES:
            existing = db.query(Expense).filter(
                Expense.notes == e["notes"]
            ).first()
            if not existing:
                db.add(Expense(
                    vehicle_id=vehicle_ids[e["vehicle_idx"]],
                    cost=e["cost"],
                    date=(now - timedelta(days=e["days_ago"])).date(),
                    category=e["category"],
                    notes=e["notes"],
                ))
        db.flush()

        db.commit()
        print(f"Seed complete: {len(USERS)} users, {len(VEHICLES)} vehicles, {len(DRIVERS)} drivers, {len(TRIPS)} trips, {len(MAINTENANCE_LOGS)} maintenance, {len(FUEL_LOGS)} fuel logs, {len(EXPENSES)} expenses")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
