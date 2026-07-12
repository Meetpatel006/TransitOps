# API — FastAPI backend

## Structure

```
app/
  main.py             — FastAPI app, router includes, /health
  database.py         — SQLAlchemy engine, SessionLocal, Base, get_db
  models.py           — SQLAlchemy ORM models (User, Session)
  auth/               — Auth feature module
    __init__.py       — Re-exports router
    routes.py         — Auth endpoints (register, login, me, logout)
    schemas.py        — Pydantic request/response schemas
    service.py        — Password hashing logic (_pw_key utility)
alembic/
  versions/           — Auto-generated migration files
  env.py              — Alembic runtime config
alembic.ini           — Alembic CLI config
pyproject.toml        — Dependencies (uv)
.env                  — HOST, PORT
```

## Modular pattern

Each feature is a folder under `app/`:

```
app/<feature>/
  __init__.py   — re-exports router
  routes.py     — FastAPI endpoints
  schemas.py    — Pydantic schemas
  service.py    — business logic
```

- Database models stay in `app/models.py` (or split into `app/models/` if many)
- Shared utilities go in `app/utils.py`

## Debugging

- `uv run uvicorn app.main:app --reload` — hot reload
- `uv run alembic upgrade head` — apply pending migrations
- `uv run alembic revision --autogenerate -m "msg"` — create migration after model changes
- `uv run python` — interactive shell, `from app.database import SessionLocal; db = SessionLocal()`

## Adding a new feature

1. Create `app/<feature>/` with `__init__.py`, `routes.py`, `schemas.py`, `service.py`
2. Add models to `app/models.py` if needed
3. Run `uv run alembic revision --autogenerate -m "add <feature>"` then `uv run alembic upgrade head`
4. Include router in `app/main.py` via `from app.<feature> import router`
