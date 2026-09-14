---
name: "get_active_job"
description: Check whether any edit job is currently queued or processing for a project.
type: atomic
category: jobs
requires: [project_id]
outputs: [active_job or null]
mcp_tool: get_active_job
---

# Skill: Get Active Job

## Purpose
Check if a project has an active (QUEUED or PROCESSING) job before starting a new
edit operation. Returns the active job details, or null if no job is running.

Use this as a safety check before starting new edit operations to avoid job conflicts.

## When to Use
- Before starting an edit operation to confirm no other job is running
- User asks "is there anything processing right now?"
- Resuming a session to check if a previously started job is still running

## Prerequisites
- `project_id` — from `list_projects`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project to check |

## MCP Tool Call
```json
{
  "tool": "get_active_job",
  "params": {
    "project_id": "uuid"
  }
}
```

## Expected Response (job active)
```json
{
  "job_id": "uuid",
  "status": "PROCESSING",
  "operation": "JOIN",
  "created_at": "2026-06-26T10:00:00Z"
}
```

## Expected Response (no active job)
```json
null
```

## Behavior
- If `null` is returned: safe to start a new edit operation
- If a job is returned: wait for it to complete before starting another operation.
  Switch to `get_job_status` polling with the returned `job_id`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project not found | Verify project_id |
