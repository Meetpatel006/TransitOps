# TransitOps monorepo

## Structure

```
apps/web/        — Next.js (Bun, port 3000)
apps/marketing/  — Next.js landing page (Bun, port 3001)
apps/api/        — FastAPI (uv, port 8000)
packages/shared/ — shared TypeScript types
```

## Tech stack

- **Frontend**: Next.js + TypeScript + Better Auth + Bun
- **Backend**: FastAPI + SQLAlchemy 2.0 + Alembic + Pydantic v2 + uv

## Auth flow

- Auth is centralized in the FastAPI backend at `/api/auth/`
- Both Next.js apps call the same backend for register, login, logout
- Endpoints: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
- Token-based: `Authorization: Bearer <token>` header on authenticated requests

## Commands

- `bun run dev` — start web app
- `bun run marketing:dev` — start marketing page
- `bun run api:dev` — start API
- `bun run build` — build web app
- `bun run lint` — lint web app
- `bun turbo dev` — run all dev tasks via Turborepo
- `bun turbo build` — build all apps via Turborepo

## Development workflow

1. **Install deps**: `bun install` (JS) + `cd apps/api && uv sync && cd ../..` (Python)
2. **Run migrations**: `cd apps/api && uv run alembic upgrade head && cd ../..`
3. **Run all services**: open 3 terminals — `bun run dev`, `bun run marketing:dev`, `bun run api:dev`
4. **Typecheck**: `cd apps/web && bun run tsc --noEmit` (or for marketing)
5. **Before committing**: build both frontends to catch issues

## Code conventions

- **TypeScript**: strict mode enabled in tsconfig. Prefer `type` imports (`import type { X }`).
- **Python**: type hints on all function signatures. Use Pydantic models for request/response schemas.
- **API routes**: FastAPI prefixed with `/api/` where possible. Health check at `/health`.
- **Auth**: centralized in FastAPI (app/auth.py). Token-based sessions stored in DB. Use `Authorization: Bearer <token>` header.
- **Database (API)**: SQLAlchemy 2.0 ORM with declarative models in `app/models.py`. Session management via `app/database.py`. Migrations via Alembic (`uv run alembic revision --autogenerate -m "msg"`).
- **Shared types**: put TypeScript interfaces/types in `packages/shared/index.ts`, import via `@transitops/shared`.
- **State & data fetching**: server components by default; use fetch for API calls, no extra client lib unless needed.
- **CSS**: CSS Modules or plain CSS (globals.css). No CSS-in-JS or Tailwind unless explicitly added.

## Turborepo

- Tasks `dev`, `build`, `lint` are defined in `turbo.json`.
- `build` depends on upstream `^build` (shared packages build first).
- `dev` tasks are persistent (no cache).
- Run `bun turbo <task>` to execute across all apps with caching.

## Dependencies

- **JS**: `bun add <pkg>` (run from target app dir or use `--cwd apps/<name>`)
- **Python**: `uv add <pkg>` (run from `apps/api`)
- Never add Python packages via npm or JS packages via pip/uv.
- Shared TS deps (types, utilities) go in `packages/shared/package.json`.

## Environment variables

- `apps/web/.env.local` — web app (NEXT_PUBLIC_API_URL)
- `apps/marketing/.env.local` — landing page (NEXT_PUBLIC_API_URL)
- `apps/api/.env` — backend (HOST, PORT)
- `.env*.local` files are gitignored. Keep production secrets out of the repo.
- For new env vars: add to the relevant `.env.local` (gitignored) and document in README.

## Git

- Feature branches off main.
- Commit messages: concise, imperative mood (`"Add login page"` not `"Added"` or `"adds"`).
- Squash before merging if multiple WIP commits.

## Deployment

- **Frontends**: Next.js apps can deploy to Vercel. Each app deploys independently.
- **API**: FastAPI app can deploy via `uv run uvicorn app.main:app` behind any ASGI server (gunicorn, daphne).
- Build each app separately: `cd apps/web && bun run build`, `cd apps/marketing && bun run build`.
- The API has no build step — just run `uv sync && uv run uvicorn app.main:app`.
