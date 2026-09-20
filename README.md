# Predictive Software Project Intelligence Platform

A platform that connects to a GitHub repository, imports a milestone with its full issue history, and forecasts when the milestone will finish using **Monte Carlo simulation**. It outputs P50/P85/P95 completion dates and the probability of missing the milestone deadline, with explanations of why the forecast changed.

> **This is a monitoring + forecasting layer, not a Jira/Trello clone.**

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v22+
- [pnpm](https://pnpm.io/) v12+
- [Python](https://www.python.org/) 3.11+
- [Docker](https://www.docker.com/) & Docker Compose

### Run with Docker Compose

```bash
docker compose up --build
```

This starts:

| Service     | URL                     | Description                        |
|-------------|-------------------------|------------------------------------|
| **web**     | http://localhost:3000    | Next.js frontend                   |
| **api**     | http://localhost:4000    | Express REST API                   |
| **analytics** | http://localhost:8000 | Python FastAPI analytics engine    |
| **worker**  | —                       | Background job processor (pg-boss) |
| **postgres**| localhost:5432           | PostgreSQL 16 database             |

### Local Development

```bash
# Install Node.js dependencies
pnpm install

# Generate Prisma client
pnpm db:generate

# Run all checks
pnpm lint
pnpm typecheck
pnpm test

# Python analytics
cd apps/analytics
pip install -r requirements.txt
python -m pytest
```

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for detailed architecture with diagrams.

## Documentation

| Document | Description |
|----------|-------------|
| [docs/PROJECT.md](docs/PROJECT.md) | What we're building, why, MVP scope |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System architecture with Mermaid diagrams |
| [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) | Phased implementation plan with status |
| [docs/PROGRESS.md](docs/PROGRESS.md) | Current status and decisions log |
| [docs/DEFINITIONS.md](docs/DEFINITIONS.md) | Forecast definitions and metric formulas |
| [AGENTS.md](AGENTS.md) | Standing rules for AI-assisted development |

## Project Structure

```
apps/
  api/        → Express + TypeScript REST API
  worker/     → pg-boss background job processor
  web/        → Next.js + Tailwind CSS frontend
  analytics/  → Python FastAPI analytics engine
packages/
  db/         → Prisma schema and database client
scripts/
  mining/     → Backtesting data mining (future)
  init-db.sql → Postgres initialization
docs/         → Living documentation
```

## License

Private — not yet licensed for distribution.
