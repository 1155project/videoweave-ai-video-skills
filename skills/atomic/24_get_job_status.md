---
name: "get_job_status"
description: Check the status of an asynchronous video editing job.
type: atomic
category: jobs
requires: [project_id, job_id]
outputs: [status, operation, output_file_id, credits_charged]
mcp_tool: get_job_status
---

# Skill: Get Job Status

## Purpose
Poll the status of an async edit job. All edit operations (cut, join, slow, speed up,
add audio, remove audio, add logo, add text, finalize) are asynchronous and return a
`job_id`. Use this skill to wait for completion before proceeding.

## When to Use
- After every edit operation (mandatory for async operations)
- User asks "is the job done?", "what's the status?"

## Polling Pattern
```
loop:
  status = get_job_status(project_id, job_id)
  if status == "COMPLETED": break and proceed
  if status == "FAILED":    handle error
  wait 3 seconds
  repeat
```

## Prerequisites
- `project_id` — from `list_projects`
- `job_id` — from the edit operation that started the job

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project the job belongs to |
| `job_id` | UUID string | Yes | Job to check |

## MCP Tool Call
```json
{
  "tool": "get_job_status",
  "params": {
    "project_id": "uuid",
    "job_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "job_id": "uuid",
  "status": "COMPLETED",
  "operation": "CUT",
  "created_at": "2026-06-26T10:00:00Z",
  "completed_at": "2026-06-26T10:00:15Z",
  "error_message": null,
  "output_file_id": "uuid",
  "credits_charged": 18
}
```
`output_file_id` is the file this job produced — resolvable directly, no follow-up
`list_files`/`get_track` call needed. `null` for operations with no output file (rare;
none of the standard async edit tools produce `null` here today). `credits_charged` is
the actual credits deducted for this specific job, from the billing ledger — not an
estimate (see `estimate_credits`, `../guides/05_export.md`, to price an operation
*before* running it).

## Job Statuses
| Status | Meaning | Action |
|---|---|---|
| `QUEUED` | Waiting to be processed | Continue polling |
| `PROCESSING` | Being processed now | Continue polling |
| `COMPLETED` | Finished successfully | Proceed with next step |
| `FAILED` | Error occurred | Check `error_message`; offer to retry |
| `CANCELLED` | Cancelled by user | Inform user |

## On FAILED Status
Check `error_message` in the response:
- `"Insufficient credits"` → User needs to purchase more credits
- `"File not found"` → Source file may have been deleted
- Other messages → Report the error and offer to retry

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Job or project not found | Verify IDs |
