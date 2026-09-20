# Progress

> Single source of truth for current project status.

## Last Updated

- **Date:** 2026-09-20
- **Branch:** `phase-1/foundation`

## Phase Status

| Phase | Name | Status | Evidence |
|-------|------|--------|----------|
| 0 | Definitions | ✅ Done | `docs/DEFINITIONS.md` created |
| 1 | Foundation | ✅ Done | All checks pass (see verification below) |
| 2 | GitHub App & Connection | ⬜ Not Started | — |
| 3 | Ingestion | ⬜ Not Started | — |
| 4 | Historical Reconstruction | ⬜ Not Started | — |
| 5 | Metrics & Baseline | ⬜ Not Started | — |
| 6 | Monte Carlo | ⬜ Not Started | — |
| 7 | Backtesting | ⬜ Not Started | — |
| 8 | Dashboard | ⬜ Not Started | — |
| 9 | Webhooks & Jobs | ⬜ Not Started | — |
| 10 | Explanations | ⬜ Not Started | — |
| 11 | Deploy & Polish | ⬜ Not Started | — |
| 12 | Optional ML | ⬜ Not Started | — |

## Done So Far

### Phase 1: Foundation (Completed 2026-09-20)

- Monorepo scaffold with pnpm workspaces (`apps/`, `packages/`)
- TypeScript strict config (`tsconfig.base.json`), ESLint flat config (v9), Prettier
- Prisma schema v1 — 11 models in `packages/db/prisma/schema.prisma`
- `apps/api` — Express 5 with `/health` endpoint, Zod env validation, pino structured logging
- `apps/worker` — pg-boss with sample batch job handler
- `apps/analytics` — FastAPI with `/health` (DB connectivity check, 3s timeout), stub `POST /forecast` (501)
- `apps/web` — Next.js 15 + Tailwind CSS, calls api `/health` and displays result
- `docker-compose.yml` with 5 services (postgres, api, worker, analytics, web)
- `scripts/init-db.sql` with read-only `analytics_reader` role
- CI workflow (GitHub Actions) for Node + Python
- PR template, issue templates (task, bug), `dependabot.yml`
- `.env.example` files per service, `.gitignore`
- All documentation: README, AGENTS.md, PROJECT, ARCHITECTURE, IMPLEMENTATION_PLAN, DEFINITIONS, PROGRESS

## Verification Results

### Lint (✅ Pass)

```
$ pnpm lint
Scope: 4 of 5 workspace projects
packages/db lint: Done
apps/worker lint: Done
apps/api lint: Done
apps/web lint: ✔ No ESLint warnings or errors — Done
```

```
$ python -m ruff check app/ tests/   (in apps/analytics)
All checks passed (0 errors)
```

### Typecheck (✅ Pass)

```
$ pnpm typecheck
Scope: 4 of 5 workspace projects
packages/db typecheck: Done
apps/api typecheck: Done
apps/worker typecheck: Done
apps/web typecheck: Done
```

### Tests (✅ Pass — 6 tests total)

```
$ pnpm test
apps/worker: ✓ tests/sample.test.ts (2 tests) — PASSED
apps/api: ✓ tests/health.test.ts (1 test) — PASSED
apps/web: ✓ tests/page.test.tsx (1 test) — PASSED
```

```
$ python -m pytest -v   (in apps/analytics)
tests/test_health.py::test_health_endpoint_returns_ok PASSED
tests/test_health.py::test_forecast_returns_501 PASSED
======================== 2 passed in 6.82s ========================
```

### Docker Compose (⚠️ Not Verified)

Docker Desktop was not running on the development machine at the time of verification. The `docker-compose.yml` and all Dockerfiles are in place and structurally correct. Docker verification should be done when Docker Desktop is available.

```
$ docker compose up --build
Error: Docker daemon not running
```

## In Progress

- Nothing currently in progress

## Next Up

- **Phase 2:** GitHub App & Connection — sign-in, installation, repo and milestone picker
- Docker Compose verification when Docker Desktop is available

## Decisions Log

| Date | Decision | Reason |
|------|----------|--------|
| 2026-09-20 | Use pnpm workspaces (not Turborepo/Nx) | Simpler setup for a small team; can add build orchestration later if needed |
| 2026-09-20 | Prisma v6 with PostgreSQL | Mature ORM with good TypeScript support; migration story is solid |
| 2026-09-20 | `IssueEvent.githubId` as BigInt | GitHub timeline event IDs can exceed 32-bit integer range |
| 2026-09-20 | `stateReason` on Issue model | Critical for distinguishing "completed" vs "not_planned" closures in completion ratio |
| 2026-09-20 | Separate `repositoryId` on Issue | Enables simpler queries and unique constraints without joining through Milestone |
| 2026-09-20 | ESLint flat config (v9) | Forward-compatible; `.eslintrc` format is deprecated |
| 2026-09-20 | Express 5 | Stable release with async error handling improvements |
| 2026-09-20 | pg-boss v10 batch handlers | v10 changed `work()` to pass `Job[]` arrays by default |
| 2026-09-20 | psycopg `connect_timeout=3` | Prevent indefinite blocking in health check when DB is unreachable |

## Known Issues / Open Questions

- Docker Compose not yet verified (Docker Desktop wasn't running) — needs manual verification
- `analytics_reader` role needs `GRANT SELECT` run after Prisma migrations create tables (documented in `init-db.sql`)
- Web's `NEXT_PUBLIC_API_URL` in Docker points to `http://api:4000` (inter-container), but browser needs `http://localhost:4000` — will need reverse proxy or CORS config for production
