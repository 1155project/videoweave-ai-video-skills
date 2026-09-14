---
name: "get_project_stats"
description: Get credits consumed, storage used, and estimated USD cost for a project.
type: atomic
category: project
requires: [project_id]
outputs: [project_id, credits_consumed, storage_size_mb, credit_cost_usd, estimated_cost_usd]
mcp_tool: get_project_stats
---

# Skill: Get Project Stats

## Purpose
Retrieve usage statistics for a specific project: total credits consumed by its edit
jobs, current storage used, and a rough USD cost estimate based on those credits.

## When to Use
- User asks how much a project has cost so far
- User wants to compare storage or credit usage across projects
- Before deleting a project, to show what was spent on it

## Prerequisites
- `project_id` — from `list_projects` or `create_project`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | The project to retrieve stats for |

## MCP Tool Call
```json
{
  "tool": "get_project_stats",
  "params": {
    "project_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "project_id": "uuid",
  "credits_consumed": 87,
  "storage_size_mb": 512.34,
  "credit_cost_usd": 0.0065,
  "estimated_cost_usd": 0.5655
}
```

## Notes
- `credits_consumed` is a **lifetime total** — it is not scoped to the current billing
  period, and it only counts credits deducted for this project's video-processing jobs
  (not tenant-level purchases, subscription renewals, or refunds).
- `estimated_cost_usd` is a rough estimate (`credits_consumed × credit_cost_usd`), not an
  official invoice figure.

## Output for Chaining
- `credits_consumed` / `estimated_cost_usd` → report to user, or compare against other
  projects fetched the same way

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project doesn't exist or belongs to another account | Confirm project_id with user |
| 401 Unauthorized | Session expired | Retry after session refresh |
