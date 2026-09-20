# Architecture

## Module Diagram

```mermaid
graph TB
    Browser["🌐 Browser"]
    Web["apps/web<br/>Next.js + Tailwind"]
    API["apps/api<br/>Express + TypeScript"]
    Worker["apps/worker<br/>pg-boss consumer"]
    Analytics["services/analytics<br/>FastAPI + NumPy"]
    DB[("PostgreSQL<br/>+ pg-boss queues")]
    GitHub["GitHub API<br/>+ Webhooks"]

    Browser -->|"HTTPS"| Web
    Web -->|"REST/JSON"| API
    GitHub -->|"Webhook POST<br/>(signature-verified)"| API
    API -->|"pg-boss enqueue"| DB
    Worker -->|"pg-boss consume"| DB
    Worker -->|"Prisma ORM<br/>(read/write)"| DB
    Worker -->|"Octokit<br/>(GraphQL + REST)"| GitHub
    Worker -->|"HTTP POST /forecast"| Analytics
    Analytics -->|"psycopg<br/>(READ-ONLY)"| DB
```

## Communication Table

| From | To | Protocol | Purpose |
|------|----|----------|---------|
| Browser | web | HTTPS | User interface |
| web | api | REST/JSON | API calls (proxied in production) |
| GitHub | api | HTTPS POST | Webhook deliveries (signature-verified) |
| api | PostgreSQL | pg-boss | Enqueue background jobs |
| worker | PostgreSQL | Prisma ORM | Read/write data |
| worker | GitHub | Octokit (GraphQL/REST) | Fetch milestones, issues, events, PRs |
| worker | analytics | HTTP POST | Request forecast computation |
| analytics | PostgreSQL | psycopg (READ-ONLY) | Read data for analysis |

### Security Boundaries

- **analytics** connects with a read-only PostgreSQL role (`analytics_reader`) — it can never modify data
- **Webhooks** are verified using GitHub's HMAC-SHA256 signature before processing
- **The frontend never calls GitHub or analytics directly** — all requests go through the api

## System Flows

### 1. Connect and Backfill

```mermaid
sequenceDiagram
    actor User
    participant Web as web
    participant API as api
    participant DB as PostgreSQL
    participant Worker as worker
    participant GH as GitHub

    User->>Web: Sign in with GitHub
    Web->>API: OAuth callback
    API->>DB: Create/update User
    User->>Web: Install GitHub App
    Web->>API: Installation webhook
    API->>DB: Store Installation
    User->>Web: Pick repo + milestone
    Web->>API: POST /connect
    API->>DB: Enqueue "backfill-repo" job

    Worker->>DB: Consume "backfill-repo"
    Worker->>GH: GraphQL query milestones
    Worker->>DB: Upsert Milestones
    Worker->>GH: GraphQL query issues + timeline events
    Worker->>DB: Upsert Issues + IssueEvents
    Worker->>GH: GraphQL query PRs + reviews
    Worker->>DB: Upsert PullRequests + PrReviews
    Worker->>DB: Enqueue "recompute-milestone"
```

### 2. Live Update (Webhooks)

```mermaid
sequenceDiagram
    participant GH as GitHub
    participant API as api
    participant DB as PostgreSQL
    participant Worker as worker
    participant Analytics as analytics

    GH->>API: POST /webhooks/github
    API->>API: Verify HMAC signature
    API->>DB: Check delivery ID (dedupe)
    API->>DB: Store WebhookDelivery
    API->>DB: Enqueue job (e.g., "issue-updated")

    Worker->>DB: Consume job
    Worker->>DB: Apply change (upsert Issue, append IssueEvent)
    Worker->>Analytics: POST /forecast
    Analytics->>DB: Read milestone data (read-only)
    Analytics->>Analytics: Run simulation
    Analytics-->>Worker: Forecast result
    Worker->>DB: Store Forecast + ForecastExplanation

    Note over Worker,DB: Nightly reconcile job<br/>repairs missed webhooks
```

### 3. Forecast Pipeline

```mermaid
flowchart TB
    A["Input: milestone ID + as-of date"] --> B["Reconstruct state<br/>using events ≤ as-of date"]
    B --> C["Build weekly throughput series"]
    B --> D["Build scope-added/removed series"]
    C --> E["Bootstrap ~10k simulations"]
    D --> E
    E --> F["Calculate quantiles:<br/>P50 / P85 / P95"]
    E --> G["Calculate P(miss deadline)"]
    F --> H["Assign confidence label"]
    G --> H
    H --> I["Run counterfactual explanations:<br/>swap one input at a time"]
    I --> J["Output: Forecast + Explanations"]

    style A fill:#e1f5fe
    style J fill:#e8f5e9
```

### 4. Backtest (Offline)

```mermaid
flowchart TB
    A["Mine completed milestones<br/>from public repos"] --> B["For each milestone"]
    B --> C["For each as-of date<br/>(weekly snapshots)"]
    C --> D["Reconstruct state<br/>as of that date"]
    D --> E["Generate forecast"]
    E --> F["Compare with actual<br/>completion date"]
    F --> G["Record: error, bias,<br/>coverage, calibration"]
    G --> C
    C -->|"All dates done"| B
    B -->|"All milestones done"| H["Generate report:<br/>vs. baseline, vs. success criteria"]

    style A fill:#fff3e0
    style H fill:#e8f5e9
```

## Database Overview

The schema is managed by Prisma (`packages/db/prisma/schema.prisma`). Key models:

| Model | Purpose | Unique Key |
|-------|---------|------------|
| User | GitHub user who connected | `githubId` |
| Installation | GitHub App installation | `githubId` |
| Repository | Connected repository | `githubId`, `fullName` |
| Milestone | GitHub milestone | `(repositoryId, githubId)` |
| Issue | GitHub issue | `(repositoryId, githubId)` |
| IssueEvent | Timeline events (opened, closed, milestoned, etc.) | `githubId` (BigInt) |
| PullRequest | GitHub pull request | `(repositoryId, githubId)` |
| PrReview | PR review | `githubId` |
| WebhookDelivery | Deduplicated webhook | `deliveryId` |
| Forecast | Forecast result at a point in time | Indexed on `(milestoneId, asOfDate)` |
| ForecastExplanation | Counterfactual explanation | FK to Forecast |
