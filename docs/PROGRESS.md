# Progress Tracking & Status

> Single source of truth for tracking what needs to be built, what has been built, verification results, decisions, and next steps.

## Last Updated

- **Date:** 2026-09-20
- **Branch:** `phase-1/foundation`

---

## 📊 High-Level Roadmap Overview

| Phase | Phase Name | Status | Completion Target / Criteria | Verification / Evidence |
|-------|------------|--------|------------------------------|-------------------------|
| **0** | **Definitions** | ✅ Done | Core definitions & formulas documented | [docs/DEFINITIONS.md](DEFINITIONS.md) |
| **1** | **Foundation** | ✅ Done | Scaffold, Prisma, Docker, CI, Docs, /health | All lint/typecheck/tests pass |
| **2** | **GitHub App & Connection** | ⬜ Not Started | User sign-in, app install, repo/milestone picker | Pending Phase 2 |
| **3** | **Ingestion** | ⬜ Not Started | GraphQL backfill, timeline events, idempotent upserts | Pending Phase 3 |
| **4** | **Historical Reconstruction** | ⬜ Not Started | Milestone state reconstruction as of date X (no leakage) | Pending Phase 4 |
| **5** | **Metrics & Baseline** | ⬜ Not Started | Weekly throughput, scope changes, completion ratio | Pending Phase 5 |
| **6** | **Monte Carlo** | ⬜ Not Started | Bootstrap simulation, quantiles, P(miss), CLI | Pending Phase 6 |
| **7** | **Backtesting** | ⬜ Not Started | Mined milestone replay harness, accuracy report | Pending Phase 7 |
| **8** | **Dashboard** | ⬜ Not Started | Next.js UI, burn-up chart, forecast band | Pending Phase 8 |
| **9** | **Webhooks & Jobs** | ⬜ Not Started | HMAC webhooks, dedupe, nightly reconcile job | Pending Phase 9 |
| **10**| **Explanations** | ⬜ Not Started | Counterfactual reruns & narrative generator | Pending Phase 10 |
| **11**| **Deploy & Polish** | ⬜ Not Started | Production builds, deployment, README diagram | Pending Phase 11 |
| **12**| **Optional ML** | ⬜ Not Started | Train ML model vs. Monte Carlo backtest baseline | Pending Phase 12 |

---

## ✅ What Has Been Built (Done)

### Phase 0: Definitions
- [x] Defined forecast outputs: P50, P85, P95 completion dates, P(miss deadline), confidence label
- [x] Defined MVP Metric: Issue-based completion ratio = `issues_closed_as_completed / total_scope`
- [x] Defined scope rules: `not_planned` and `duplicate` closures count as scope removals
- [x] Defined low-confidence rule: `< 4 weeks` of issue history gets `"low"` confidence label
- [x] Defined milestone completion date: closedAt timestamp of last non-cancelled issue (not `milestone.closed_at`)
- [x] Documented in [docs/DEFINITIONS.md](DEFINITIONS.md)

### Phase 1: Foundation (Completed 2026-09-20)
- [x] Monorepo scaffold with `pnpm` workspaces (`apps/api`, `apps/worker`, `apps/web`, `apps/analytics`, `packages/db`)
- [x] Shared TypeScript strict base config (`tsconfig.base.json`), ESLint flat config (`eslint.config.mjs`), Prettier (`.prettierrc`)
- [x] Prisma schema v1 with 11 models & GitHub ID unique keys (`packages/db/prisma/schema.prisma`)
- [x] PostgreSQL database initialization script with `analytics_reader` read-only role (`scripts/init-db.sql`)
- [x] API Service (`apps/api`): Express 5, Zod env validation, pino logger, `GET /health`
- [x] Worker Service (`apps/worker`): `pg-boss` consumer with sample batch job handler
- [x] Analytics Service (`apps/analytics`): FastAPI Python service with DB connectivity check (`GET /health`, 3s timeout) and stub `POST /forecast` (501)
- [x] Web Frontend (`apps/web`): Next.js 15 + Tailwind CSS, client component calling `api /health`
- [x] Docker Compose (`docker-compose.yml`) for `postgres`, `api`, `worker`, `analytics`, `web`
- [x] GitHub Actions CI (`.github/workflows/ci.yml`) for Node.js (lint, typecheck, test) and Python (ruff, pytest)
- [x] Repository templates: PR template, task issue template, bug issue template, `dependabot.yml`
- [x] Environment files (`.env.example` per service) & `.gitignore`
- [x] Living documentation suite: `README.md`, `AGENTS.md`, `docs/PROJECT.md`, `docs/ARCHITECTURE.md`, `docs/IMPLEMENTATION_PLAN.md`, `docs/DEFINITIONS.md`, `docs/PROGRESS.md`

---

## 🛠️ What Needs to Be Built (Target Roadmap)

### Phase 2: GitHub App & Connection
- [ ] GitHub App manifest & registration guide
- [ ] OAuth authentication flow for user sign-in
- [ ] Installation webhook handler (`/webhooks/installation`)
- [ ] Frontend Repo & Milestone picker page
- [ ] API routes for repo/milestone connection

### Phase 3: Ingestion
- [ ] Octokit GraphQL client for backfill
- [ ] Milestone, issue, timeline event, pull request, and PR review ingestion
- [ ] Idempotent upsert logic keyed on GitHub IDs
- [ ] Resumable backfill jobs with cursor pagination
- [ ] GitHub rate-limit detection and exponential backoff

### Phase 4: Historical Reconstruction
- [ ] Event-sourced historical milestone state builder in analytics
- [ ] As-of date filter (`timestamp <= as-of date`)
- [ ] Test suite verifying no look-ahead leakage on historical datasets

### Phase 5: Metrics & Baseline
- [ ] Weekly throughput calculation module
- [ ] Scope change (addition/removal) series builder
- [ ] PR cycle time & review latency metrics
- [ ] Deterministic baseline forecaster (`remaining / average throughput`)

### Phase 6: Monte Carlo Simulation
- [ ] Bootstrapping simulation engine (NumPy / pandas)
- [ ] Scope-change sampling during projection
- [ ] Quantile calculation (P50, P85, P95) and P(miss deadline)
- [ ] Confidence label evaluator (low / medium / high)
- [ ] Interactive CLI / Jupyter notebook slice for ad-hoc forecasts
- [ ] `POST /forecast` production endpoint implementation

### Phase 7: Backtesting Framework
- [ ] Public repository milestone mining scripts (`scripts/mining`)
- [ ] Historical milestone replay harness
- [ ] Accuracy evaluation metrics (MAE, bias, coverage, calibration)
- [ ] Backtest report generator vs. baseline

### Phase 8: Dashboard & Visualizations
- [ ] Next.js dashboard UI with Recharts
- [ ] Burn-up chart with forecast confidence band
- [ ] Completion ratio & risk percentage cards
- [ ] Metrics panel with visual separation of observed vs. calculated vs. predicted

### Phase 9: Webhooks & Live Updates
- [ ] GitHub Webhook endpoint with HMAC-SHA256 signature verification
- [ ] Webhook delivery deduplication (`WebhookDelivery` table)
- [ ] Event-triggered recompute jobs via `pg-boss`
- [ ] Nightly reconciliation job for missed webhooks
- [ ] Historical forecast recording and visualization

### Phase 10: Counterfactual Explanations
- [ ] Counterfactual simulation engine (one-factor-at-a-time sensitivity analysis)
- [ ] Structured explanation data model (`ForecastExplanation`)
- [ ] Human-readable "why the forecast changed" narrative generator

### Phase 11: Production Deployment & Polish
- [ ] Multi-stage production Dockerfiles
- [ ] Infrastructure setup & monitoring
- [ ] Final README polish with architecture diagrams & demo repository link

### Phase 12: Optional Machine Learning
- [ ] Feature engineering from historical milestone series
- [ ] Model training (offline) split by repository
- [ ] Comparative evaluation: ML vs. Monte Carlo in backtesting harness

---

## 🔍 Verification Evidence

### 1. Code Quality & Formatting (✅ Pass)
- `pnpm lint` — All Node workspaces clean (0 errors).
- `python -m ruff check app/ tests/` — All Python files clean (0 errors).

### 2. Static Type Checks (✅ Pass)
- `pnpm typecheck` — TypeScript strict compilation passes for `@ppi/db`, `@ppi/api`, `@ppi/worker`, `@ppi/web`.

### 3. Automated Test Suite (✅ Pass — 6 Tests)
- `apps/worker`: 2 unit tests passing (`sample-job` handler and data type validation).
- `apps/api`: 1 unit test passing (`healthRouter` Express setup).
- `apps/web`: 1 unit test passing (`Home` component import & module structure).
- `apps/analytics`: 2 Pytest tests passing (`/health` status check & `/forecast` 501 stub check).

---

## 📝 Decisions Log

| Date | Decision | Reason / Context |
|------|----------|------------------|
| 2026-09-20 | Monorepo layout with `pnpm` workspaces | Fast, lightweight monorepo management without extra build system overhead |
| 2026-09-20 | Prisma v6 ORM for PostgreSQL | Single source of truth for database schema with generated TypeScript types |
| 2026-09-20 | Read-only Postgres role (`analytics_reader`) | Guarantees Python analytics service never writes or corrupts primary database |
| 2026-09-20 | `IssueEvent.githubId` as `BigInt` | Prevents overflow on large GitHub timeline event IDs |
| 2026-09-20 | Store `stateReason` on Issue model | Allows distinguishing completed issues vs scope removals (`not_planned`/`duplicate`) |
| 2026-09-20 | Express 5 for API Service | Built-in async error handling and modern middleware support |
| 2026-09-20 | `pg-boss` v10 batch handler support | `pg-boss` v10 passes `Job[]` arrays to work handlers by default |
| 2026-09-20 | 3-second database connection timeout in analytics | Prevents health check endpoint from hanging when DB is unreachable |

---

## 🚀 Next Action Items

1. **Verify Docker Compose**: Run `docker compose up --build` when Docker Desktop is running.
2. **Begin Phase 2**: Implement GitHub App registration and OAuth connection flow.
