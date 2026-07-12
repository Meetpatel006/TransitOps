import random
import sys
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models.auth import Role, User
from app.models.fleet import Driver, Expense, FuelLog, MaintenanceLog, Trip, Vehicle
from app.auth.service import hash_password

ROLES = ["Admin", "Fleet Manager", "Dispatcher", "Driver", "Safety Officer", "Financial Analyst"]

FIRST_NAMES = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Krishna", "Ishaan", "Kabir",
               "Ananya", "Diya", "Saanvi", "Aadhya", "Pari", "Anika", "Navya", "Kiara", "Myra", "Riya",
               "Frank", "Grace", "Sam", "Dee", "Alice", "Finn", "Priya", "Suresh", "John", "Alex"]
LAST_NAMES = ["Patel", "Shah", "Mehta", "Desai", "Joshi", "Verma", "Sharma", "Gupta", "Kumar", "Singh",
              "Reddy", "Nair", "Rao", "Iyer", "Bose", "Das", "Khan", "Malik", "Roy", "Chopra"]

CITIES = ["Gandhinagar Depot", "Ahmedabad Hub", "Vatva Industrial Area", "Sanand Warehouse", "Mansa",
          "Kalol Depot", "Naroda", "Vastral", "SG Highway", "Airport Cargo", "Ashram Road", "Satellite Depot",
          "Maninagar", "Bopal", "Chandkheda", "Nikol", "Thaltej", "Bodakdev"]

VEHICLE_TYPES = ["Van", "Truck", "Mini", "Tempo", "Bus"]
VEHICLE_MODELS = ["VAN", "TRUCK", "MINI", "TEMPO", "BUS"]
VEHICLE_STATUSES = ["Available", "On Trip", "In Shop", "Retired"]
LICENSE_CATEGORIES = ["LMV", "HMV", "MCWG", "LMV-TR"]
DRIVER_STATUSES = ["Available", "On Trip", "Off Duty", "Suspended"]
TRIP_STATUSES = ["Draft", "Dispatched", "Completed", "Cancelled"]
MAINT_TITLES = ["Oil Change", "Engine Repair", "Tyre Replace", "Brake Service", "AC Service",
                "General Service", "Battery Replace", "Clutch Repair", "Wheel Alignment"]
EXPENSE_CATEGORIES = ["Toll", "Other", "Fuel", "Loading", "Parking", "Insurance"]

USED_EMAILS: set[str] = set()
USED_LICENSE: set[str] = set()
USED_REG: set[str] = set()

# ponytail: stdlib random only, no faker dependency. Seeded for reproducibility.
random.seed(42)


def _email(first: str, last: str) -> str:
    base = f"{first.lower()}.{last.lower()}"
    i = 1
    email = f"{base}@transitops.com"
    while email in USED_EMAILS:
        email = f"{base}{i}@transitops.com"
        i += 1
    USED_EMAILS.add(email)
    return email


def _license_number() -> str:
    while True:
        lic = f"DL-{random.randint(10000, 99999)}"
        if lic not in USED_LICENSE:
            USED_LICENSE.add(lic)
            return lic


def _registration() -> str:
    while True:
        reg = f"GJ01AB{random.randint(1000, 9999)}"
        if reg not in USED_REG:
            USED_REG.add(reg)
            return reg


def gen_users(n: int = 10) -> list[dict]:
    users = [
        {"email": "frank.desai@transitops.com", "name": "Frank Desai", "role": "Admin", "password": "pass5506"},
        {"email": "krishna.gupta@transitops.com", "name": "Krishna Gupta", "role": "Fleet Manager", "password": "pass2679"},
        {"email": "krishna.khan@transitops.com", "name": "Krishna Khan", "role": "Safety Officer", "password": "pass1434"},
        {"email": "driver.test@transitops.com", "name": "Driver Test", "role": "Driver", "password": "pass1234"},
    ]
    for u in users:
        USED_EMAILS.add(u["email"])
        
    for _ in range(n):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        name = f"{first} {last}"
        role = random.choice(ROLES)
        password = f"pass{random.randint(1000, 9999)}"
        users.append({"email": _email(first, last), "name": name, "role": role, "password": password})
    return users


def gen_vehicles(n: int = 8) -> list[dict]:
    vehicles = []
    for i in range(n):
        vtype = random.choice(VEHICLE_TYPES)
        vehicles.append({
            "registration_number": _registration(),
            "name_model": f"{VEHICLE_MODELS[VEHICLE_TYPES.index(vtype)]}-{random.randint(1, 99):02d}",
            "type": vtype,
            "maximum_load_capacity": random.choice([500, 750, 1000, 1500, 2500, 5000]),
            "odometer": random.randint(10000, 280000),
            "acquisition_cost": random.randint(350000, 2600000),
            "status": random.choice(VEHICLE_STATUSES),
        })
    return vehicles


def gen_drivers(n: int = 10) -> list[dict]:
    drivers = []
    for _ in range(n):
        first = random.choice(FIRST_NAMES)
        last = random.choice(LAST_NAMES)
        drivers.append({
            "name": f"{first} {last}",
            "license_number": _license_number(),
            "license_category": random.choice(LICENSE_CATEGORIES),
            "license_expiry_date": date.today() + timedelta(days=random.randint(-200, 1500)),
            "contact_number": f"9{random.randint(100000000, 999999999)}",
            "safety_score": random.randint(70, 99),
            "status": random.choice(DRIVER_STATUSES),
        })
    return drivers


def gen_trips(n: int, vehicle_ids: list[int], driver_ids: list[int]) -> list[dict]:
    trips = []
    for _ in range(n):
        source, destination = random.sample(CITIES, 2)
        trips.append({
            "source": source,
            "destination": destination,
            "vehicle_id": random.choice(vehicle_ids),
            "driver_id": random.choice(driver_ids),
            "cargo_weight": random.randint(100, 4000),
            "planned_distance": random.randint(5, 120),
            "status": random.choice(TRIP_STATUSES),
            "final_odometer": random.randint(10000, 280000) if random.random() < 0.5 else None,
            "fuel_consumed": round(random.uniform(3, 120), 1) if random.random() < 0.5 else None,
        })
    return trips


def gen_maintenance(n: int, vehicle_ids: list[int], now: datetime) -> list[dict]:
    logs = []
    for _ in range(n):
        days_ago = random.randint(1, 60)
        closed = random.random() < 0.6
        start = now - timedelta(days=days_ago + (5 if closed else 0))
        logs.append({
            "vehicle_id": random.choice(vehicle_ids),
            "title": random.choice(MAINT_TITLES),
            "description": "Auto-generated maintenance record",
            "cost": random.randint(800, 25000),
            "status": "Closed" if closed else "Open",
            "start_date": start,
            "end_date": start + timedelta(days=days_ago) if closed else None,
        })
    return logs


def gen_fuel(n: int, vehicle_ids: list[int], now: datetime) -> list[dict]:
    logs = []
    for _ in range(n):
        logs.append({
            "vehicle_id": random.choice(vehicle_ids),
            "liters": round(random.uniform(20, 120), 1),
            "cost": random.randint(1500, 9000),
            "date": (now - timedelta(days=random.randint(0, 60))).date(),
        })
    return logs


def gen_expenses(n: int, vehicle_ids: list[int], now: datetime) -> list[dict]:
    logs = []
    for _ in range(n):
        logs.append({
            "vehicle_id": random.choice(vehicle_ids),
            "cost": random.randint(50, 600),
            "date": (now - timedelta(days=random.randint(0, 60))).date(),
            "category": random.choice(EXPENSE_CATEGORIES),
            "notes": "Auto-generated expense",
        })
    return logs


def seed():
    from app.database import engine
    from app.models.auth import Base
    # Also import all other bases or just the main Base that tracks all models
    from app.database import Base
    # Create all tables in case they don't exist (important for ephemeral SQLite on Render)
    Base.metadata.create_all(bind=engine)
    
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

        users = gen_users(10)
        for u in users:
            db.add(User(
                email=u["email"],
                name=u["name"],
                role_id=role_map[u["role"]],
                hashed_password=hash_password(u["password"]),
            ))
        db.flush()

        vehicle_ids = []
        for v in gen_vehicles(8):
            veh = Vehicle(**v)
            db.add(veh)
            db.flush()
            vehicle_ids.append(veh.id)

        driver_ids = []
        for d in gen_drivers(10):
            drv = Driver(**d)
            db.add(drv)
            db.flush()
            driver_ids.append(drv.id)

        for t in gen_trips(20, vehicle_ids, driver_ids):
            db.add(Trip(**t))
        db.flush()

        for m in gen_maintenance(15, vehicle_ids, now):
            db.add(MaintenanceLog(**m))
        db.flush()

        for f in gen_fuel(20, vehicle_ids, now):
            db.add(FuelLog(**f))
        db.flush()

        for e in gen_expenses(20, vehicle_ids, now):
            db.add(Expense(**e))
        db.flush()

        db.commit()
        print(f"Seed complete: {len(users)} users, {len(vehicle_ids)} vehicles, {len(driver_ids)} drivers, "
              f"20 trips, 15 maintenance, 20 fuel logs, 20 expenses")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
