# AGENTS.md — Standing Rules

These rules apply to all development on this project, including AI-assisted coding.

## (a) TypeScript Strict; Zod Validation

- TypeScript strict mode is enabled everywhere (`tsconfig.base.json`).
- All external input (API requests, environment variables, webhook payloads) must be validated with [Zod](https://zod.dev/).
- No `any` types without explicit justification.

## (b) Prisma Owns the Schema; Analytics Is Read-Only

- The database schema is owned by Prisma in `packages/db/prisma/schema.prisma`.
- The analytics service (`apps/analytics`) connects with a **read-only** PostgreSQL role (`analytics_reader`) and must **never** write to the database.
- Schema changes go through Prisma migrations only.

## (c) Idempotent Ingestion

- All data ingestion uses upserts keyed on GitHub IDs (`githubId`, `deliveryId`).
- Running a backfill twice must produce identical rows.
- Webhook deliveries are deduplicated by `deliveryId` (GitHub's `X-GitHub-Delivery` header).

## (d) No Look-Ahead Leakage

- State reconstruction must use only events with `timestamp <= as-of date`.
- Never access future data when reconstructing historical state.
- Tests must verify this property explicitly.

## (e) Never Commit Secrets

- No API keys, tokens, passwords, or `.pem` files in the repository.
- Use `.env` files (gitignored) and `.env.example` for documentation.
- CI secrets go in GitHub Actions secrets.

## (f) Stay in Phase

- Do not add features outside the current implementation phase.
- Refer to [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the current phase.

## (g) Docs Are Part of Done

At the end of **every task**, update:

1. **`docs/PROGRESS.md`** — status, what was verified, next up, decisions
2. **`docs/ARCHITECTURE.md`** — if the change affects architecture
3. **`docs/IMPLEMENTATION_PLAN.md`** — if a phase status changes
4. **`docs/DEFINITIONS.md`** — if definitions or metrics change

Documentation updates must be in the **same commit** as the code. A task is not finished until the docs match the code.

## (h) Tests and Summary

- Every task ends with passing tests.
- Provide a short summary of changes at the end of each task.

## (i) Git Rules

- **Branch naming:** `phase-N/short-description`
- **Commit style:** small [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `test:`, `docs:`, `chore:`)
- **Never** push to or merge into `main` — only the project owner opens and merges PRs.
- **Never** force-push or rewrite history.
- Feature branches may be pushed freely.
