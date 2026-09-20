# Definitions

## Forecast Target

The forecast predicts **when a GitHub milestone will be completed**, expressed as probabilistic completion dates.

### Forecast Outputs

| Output | Description |
|--------|-------------|
| **P50** | Median completion date — 50% chance of finishing by this date |
| **P85** | 85th percentile — 85% chance of finishing by this date |
| **P95** | 95th percentile — 95% chance of finishing by this date |
| **P(miss deadline)** | Probability (0.0–1.0) that the milestone won't finish by its `dueOn` date |
| **Confidence label** | `"low"` / `"medium"` / `"high"` — reflects data quality and history length |

---

## Issue-Based Completion Ratio

The MVP metric. Measures progress toward milestone completion.

```
completion_ratio = issues_closed_as_completed / total_scope
```

Where:
- **issues_closed_as_completed** = count of issues in the milestone with `state = "closed"` and `stateReason = "completed"`
- **total_scope** = total number of issues currently in the milestone (open + closed as completed)

### Scope Rules

| Event | Effect on Scope |
|-------|----------------|
| Issue added to milestone (`milestoned` event) | Scope increases by 1 |
| Issue removed from milestone (`demilestoned` event) | Scope decreases by 1 |
| Issue closed as **completed** | Numerator increases by 1 |
| Issue closed as **not_planned** | Scope decreases by 1 (treated as scope removal) |
| Issue closed as **duplicate** | Scope decreases by 1 (treated as scope removal) |
| Issue reopened | Numerator decreases by 1 |

### Key Principle

Issues closed as "not planned" or "duplicate" are **scope removals**, not completions. They reduce the denominator, not increase the numerator. This prevents inflating the completion ratio by closing issues without completing them.

---

## Confidence Label

| Label | Criteria |
|-------|----------|
| **Low** | Fewer than ~4 weeks of issue-closing history in the milestone |
| **Medium** | 4–8 weeks of history |
| **High** | More than 8 weeks of history with consistent throughput |

Forecasts with a "low" confidence label should be presented with a clear warning that the prediction may be unreliable due to insufficient historical data.

---

## Milestone Completion Definition

A milestone is **completed** when the last non-cancelled issue is closed.

Specifically:
- **Completion date** = the `closedAt` timestamp of the last issue with `stateReason = "completed"` in the milestone
- **NOT** `milestone.closed_at` — GitHub's milestone close event may happen at a different time than the last issue close
- Issues with `stateReason = "not_planned"` or `"duplicate"` are excluded from the completion date calculation

---

## Historical Reconstruction Rule

When reconstructing the state of a milestone as of a specific date:

> **Only use events with `timestamp ≤ as-of date`.**

This means:
- No future issue closings are visible
- No future scope changes are visible
- No future milestoned/demilestoned events are visible
- The reconstruction must produce the exact state that would have been observable at that point in time

This rule is critical for:
1. **Backtesting** — prevents look-ahead bias in forecast evaluation
2. **Forecast accuracy** — ensures forecasts are based only on available information
3. **Reproducibility** — the same as-of date always produces the same state

---

## Throughput

Weekly throughput is measured as:

```
weekly_throughput = issues_closed_as_completed_in_week / 1 week
```

The Monte Carlo simulation bootstraps from the observed weekly throughput distribution to project future completion rates.

---

## Scope Change Rate

Weekly scope change is measured as:

```
weekly_scope_change = (issues_added - issues_removed) in week
```

Where:
- **issues_added** = `milestoned` events in the week
- **issues_removed** = `demilestoned` events + issues closed as `not_planned` / `duplicate` in the week

The simulation samples from observed scope change rates to account for scope creep.
