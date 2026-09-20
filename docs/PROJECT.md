# Project: Predictive Software Project Intelligence Platform

## What We Are Building

A platform that connects to a GitHub repository, imports a GitHub milestone with its full issue history, and **forecasts when the milestone will finish** using Monte Carlo simulation (no ML training required).

### Outputs

- **P50 / P85 / P95 completion dates** — probabilistic forecasts
- **Probability of missing the milestone deadline** — risk percentage
- **Confidence label** — low / medium / high based on data quality
- **Explanations** — structured "why the forecast changed" text via counterfactual reruns

### MVP Metric

The core metric is **issue-based completion ratio**:

```
completion_ratio = issues_closed_as_completed / total_scope_at_time
```

This is NOT "project progress" — it specifically measures completed issues against the current milestone scope.

## Why

Software project timelines are notoriously hard to estimate. Existing tools either:
- Require manual story-point estimates (subjective, often skipped)
- Use simple velocity calculations (ignore scope changes)
- Don't account for uncertainty (give a single date)

This platform uses **actual historical throughput data** from GitHub to generate probabilistic forecasts that account for scope creep, variable velocity, and uncertainty.

## What This Is NOT

- ❌ **Not a project management tool** — no task boards, no assignments, no workflows
- ❌ **Not a Jira/Trello clone** — we don't replace issue trackers
- ❌ **Not ML-first** — Monte Carlo simulation is the primary method; ML is an optional Phase 12 enhancement that must beat Monte Carlo in backtesting to be kept
- ❌ **Not a GitHub replacement** — we're a monitoring layer that reads from GitHub
- ❌ **Not a real-time dashboard** — updates propagate via webhooks, typically within ~1 minute

## MVP Scope

### In Scope

1. Connect to a GitHub repository via GitHub App
2. Import a milestone with full issue history (including timeline events)
3. Reconstruct historical milestone state as of any date
4. Calculate weekly throughput, scope changes, and completion ratio
5. Run Monte Carlo simulation for probabilistic forecasts
6. Display forecasts on a dashboard with burn-up chart and forecast band
7. Live updates via webhooks with forecast history
8. Counterfactual explanations for forecast changes
9. Backtesting framework to validate forecast accuracy

### Out of Scope

- Multi-repo aggregation (single repo per view for MVP)
- Story points or custom weighting (pure issue count)
- Sprint/iteration tracking
- Team-level analytics or individual contributor metrics
- Notifications or alerts
- Mobile app
- Public API for third-party integrations
- Multi-tenancy / enterprise features
- Custom deployment configurations
