import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import SessionLocal
from app.models.auth import Role, User
from app.auth.service import hash_password

ROLES = ["Admin", "Fleet Manager", "Driver", "Safety Officer", "Financial Analyst"]

DEMO_USERS = [
    {"email": "admin@transitops.com", "name": "Alice Admin", "role": "Admin", "password": "admin123"},
    {"email": "fleet@transitops.com", "name": "Frank Fleet", "role": "Fleet Manager", "password": "fleet123"},
    {"email": "driver@transitops.com", "name": "Diana Driver", "role": "Driver", "password": "driver123"},
    {"email": "safety@transitops.com", "name": "Sam Safety", "role": "Safety Officer", "password": "safety123"},
    {"email": "finance@transitops.com", "name": "Finn Finance", "role": "Financial Analyst", "password": "finance123"},
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

        for u in DEMO_USERS:
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
        db.commit()
        print("Seed complete.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
