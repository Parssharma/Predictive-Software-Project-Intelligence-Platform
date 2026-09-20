# Implementation Plan

## Phase Status

| Phase | Name | Status | Dependencies |
|-------|------|--------|-------------|
| 0 | Definitions | ✅ Done | — |
| 1 | Foundation | ✅ Done | Phase 0 |
| 2 | GitHub App & Connection | ⬜ Not Started | Phase 1 |
| 3 | Ingestion | ⬜ Not Started | Phase 2 |
| 4 | Historical Reconstruction | ⬜ Not Started | Phase 3 |
| 5 | Metrics & Baseline | ⬜ Not Started | Phase 4 |
| 6 | Monte Carlo | ⬜ Not Started | Phase 5 |
| 7 | Backtesting | ⬜ Not Started | Phase 6 |
| 8 | Dashboard | ⬜ Not Started | Phase 6 |
| 9 | Webhooks & Jobs | ⬜ Not Started | Phase 3, 8 |
| 10 | Explanations | ⬜ Not Started | Phase 6, 9 |
| 11 | Deploy & Polish | ⬜ Not Started | Phase 8, 9, 10 |
| 12 | Optional ML | ⬜ Not Started | Phase 7 |

---

## Phase 0: Definitions

**What:** Define forecast target, completion definition, scope rules, minimum-history rule, MVP success criteria.

**Done when:** `docs/DEFINITIONS.md` exists with all definitions.

**Status:** ✅ Done — `docs/DEFINITIONS.md` created with completion ratio formula, scope rules, confidence gates, and milestone completion definition.

---

## Phase 1: Foundation

**What:** Monorepo scaffold, Docker Compose, Prisma schema v1, CI pipeline.

**Done when:** `docker compose up` starts every service and CI is green.

**Deliverables:**
- [x] pnpm workspace with `apps/` and `packages/` layout
- [x] TypeScript strict config (`tsconfig.base.json`)
- [x] ESLint + Prettier configuration
- [x] Prisma schema v1 (11 models with GitHub ID unique constraints)
- [x] `apps/api` — Express + /health + Zod env validation
- [x] `apps/worker` — pg-boss + sample job
- [x] `apps/analytics` — FastAPI + /health + stub POST /forecast (501)
- [x] `apps/web` — Next.js + Tailwind, calls api /health
- [x] `docker-compose.yml` with postgres, api, worker, analytics, web
- [x] `scripts/init-db.sql` — read-only role for analytics
- [x] CI workflow (GitHub Actions)
- [x] PR template, issue templates, dependabot.yml
- [x] `.env.example` per service, `.gitignore`
- [x] Verification: all services start, health endpoints respond, tests pass
- [x] `docs/PROGRESS.md` updated with verification results

**Status:** ✅ Done — All lint, typecheck, and tests pass. Docker Compose pending Docker Desktop availability.

---

## Phase 2: GitHub App & Connection

**What:** GitHub App sign-in, installation, repo and milestone picker UI.

**Done when:** A user can pick a repo and milestone and it is saved to the database.

**Deliverables:**
- GitHub App registration guide
- OAuth sign-in flow
- Installation webhook handler
- Repo + milestone picker UI
- API endpoints for connection flow

---

## Phase 3: Ingestion

**What:** GraphQL backfill, event storage (incl. milestoned/demilestoned timeline events), idempotent upserts, resumable jobs, rate-limit handling.

**Done when:** Backfilling twice gives identical rows and an interrupted backfill resumes.

**Deliverables:**
- Octokit GraphQL queries for milestones, issues, timeline events, PRs, reviews
- Idempotent upsert logic using GitHub IDs
- Resumable job state (cursor storage)
- Rate-limit detection and backoff
- Tests proving idempotency and resumability

---

## Phase 4: Historical Reconstruction

**What:** Reconstruct the state of a milestone as of date X using only events ≤ X.

**Done when:** Tests prove no look-ahead leakage.

**Deliverables:**
- State reconstruction function in analytics service
- Event-sourced milestone state builder
- Tests with known datasets verifying no future data leaks

---

## Phase 5: Metrics & Baseline

**What:** Weekly throughput, scope added/removed, remaining count, completion ratio, PR cycle time, review time. Baseline forecast = remaining / average throughput.

**Done when:** Metrics match hand-calculations on 2–3 real milestones.

**Deliverables:**
- Metric calculation functions
- Baseline (deterministic) forecaster
- Validation against hand-calculated expected values

---

## Phase 6: Monte Carlo

**What:** Bootstrap simulation with scope-change sampling, quantiles, P(miss), confidence gate. CLI/notebook slice for interactive exploration.

**Done when:** Forecasts look sensible on real repos and synthetic-data test shows calibration when assumptions hold.

**Deliverables:**
- Monte Carlo simulator (NumPy)
- Confidence labeling (low / medium / high)
- POST /forecast endpoint (replaces 501 stub)
- CLI tool for ad-hoc forecasts
- Synthetic-data calibration test

---

## Phase 7: Backtesting

**What:** Mining scripts, dataset of completed milestones, replay harness, error/bias/coverage/calibration reports vs. baseline.

**Done when:** Results report exists against pre-defined success criteria.

**Deliverables:**
- Mining scripts for public repos
- Replay harness
- Error, bias, coverage, calibration metrics
- Comparison report: Monte Carlo vs. baseline

---

## Phase 8: Dashboard

**What:** Completion ratio display, P50/P85/P95 vs. deadline, burn-up chart with forecast band, risk percentage, metrics panel. Observed/calculated/predicted visibly separated.

**Done when:** A connected repo shows a live forecast end to end.

**Deliverables:**
- Dashboard page with Recharts visualizations
- Burn-up chart with forecast confidence band
- Risk indicator
- Metrics panel
- Clear visual separation of observed vs. calculated vs. predicted

---

## Phase 9: Webhooks & Jobs

**What:** Signed webhook endpoint, delivery deduplication, recompute jobs, nightly reconciliation, forecast history.

**Done when:** Closing a GitHub issue updates the dashboard within ~1 minute and a dropped webhook is repaired by the nightly job.

**Deliverables:**
- Webhook signature verification
- Delivery deduplication via `WebhookDelivery` table
- Recompute-milestone jobs
- Nightly reconciliation cron job
- Forecast history storage and display

---

## Phase 10: Explanations

**What:** Counterfactual reruns producing structured "why the forecast changed" text.

**Done when:** Each forecast includes explanation data showing which inputs drove the change.

---

## Phase 11: Deploy & Polish

**What:** Production builds, deployment, monitoring, README with diagram, demo repo.

**Done when:** Platform is deployed and accessible with monitoring.

---

## Phase 12: Optional ML

**What:** Only if backtesting leaves room for improvement. Train offline, split by repository, keep only if it beats Monte Carlo.

**Done when:** ML model either beats Monte Carlo in backtesting and is integrated, or is rejected with documented reasoning.
