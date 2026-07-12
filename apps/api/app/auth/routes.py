from uuid import uuid4

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session as DBSession

from app.auth.schemas import AuthOut, LoginInput, RegisterInput, UserOut
from app.auth.service import check_password, hash_password
from app.database import get_db
from app.models.auth import Role, Session, User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register(body: RegisterInput, db: DBSession = Depends(get_db)):
    existing = db.scalar(select(User).where(User.email == body.email))
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    role = db.scalar(select(Role).where(Role.name == body.role))
    if not role:
        raise HTTPException(status_code=400, detail=f"Role '{role_name}' not found")
    user = User(
        email=body.email,
        name=body.name,
        hashed_password=hash_password(body.password),
        role_id=role.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    session = Session(user_id=user.id, token=uuid4().hex)
    db.add(session)
    db.commit()
    return AuthOut(
        token=session.token,
        user=UserOut(id=user.id, email=user.email, name=user.name, role_name=user.role.name),
    )


@router.post("/login")
def login(body: LoginInput, db: DBSession = Depends(get_db)):
    user = db.scalar(select(User).where(User.email == body.email))
    if not user or not check_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.role.name != body.role:
        raise HTTPException(status_code=403, detail="Role mismatch")
    session = Session(user_id=user.id, token=uuid4().hex)
    db.add(session)
    db.commit()
    return AuthOut(
        token=session.token,
        user=UserOut(id=user.id, email=user.email, name=user.name, role_name=user.role.name),
    )


def get_current_user(
    authorization: str = Header(None),
    db: DBSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ")
    session = db.scalar(select(Session).where(Session.token == token))
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return session.user


def require_role(*roles: str):
    def _check(user: User = Depends(get_current_user)):
        if user.role.name not in roles:
            raise HTTPException(
                status_code=403, detail="Insufficient permissions"
            )
        return user

    return _check


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return UserOut(id=user.id, email=user.email, name=user.name, role_name=user.role.name)


@router.post("/logout", status_code=204)
def logout(
    authorization: str = Header(None),
    db: DBSession = Depends(get_db),
):
    if not authorization or not authorization.startswith("Bearer "):
        return
    token = authorization.removeprefix("Bearer ")
    db.query(Session).filter(Session.token == token).delete()
    db.commit()
