# TransitOps

Monorepo with Next.js frontend + FastAPI backend.

## Structure

```
apps/
  web/        # main Next.js app (Bun)
  marketing/  # landing page (Next.js / Bun)
  api/        # FastAPI (uv)
packages/
  shared/     # shared TypeScript types
```

## Prerequisites

- [Bun](https://bun.sh) >= 1.3
- [uv](https://docs.astral.sh/uv) >= 0.4
- Python >= 3.12

## Quick start

```bash
# install all JS dependencies
bun install

# install Python dependencies
cd apps/api && uv sync && cd ../..

# start the main app       (http://localhost:3000)
bun run dev

# start the marketing page (http://localhost:3001)
bun run marketing:dev

# start the API            (http://localhost:8000)
bun run api:dev
```

Open separate terminals for each service.

## Scripts

| Command                 | Runs in              |
| ----------------------- | -------------------- |
| `bun run dev`           | apps/web (next dev)  |
| `bun run build`         | apps/web (next build)|
| `bun run lint`          | apps/web (next lint) |
| `bun run marketing:dev` | apps/marketing       |
| `bun run marketing:build`| apps/marketing      |
| `bun run api:dev`       | apps/api (uvicorn)   |

## Environment

- `apps/web/.env.local` — main app env vars
- `apps/marketing/.env.local` — landing page env vars
- `apps/api/.env` — backend env vars

## Test Credentials

After seeding the database, you can use the following default credentials to log in and test different role-based views:

| Role | Email | Password |
|---|---|---|
| Admin | `frank.desai@transitops.com` | `pass5506` |
| Fleet Manager | `krishna.gupta@transitops.com` | `pass2679` |
| Safety Officer | `krishna.khan@transitops.com` | `pass1434` |
| Driver | `driver.test@transitops.com` | `pass1234` |
