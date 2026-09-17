---
name: "adjust_brightness"
description: Adjust a clip's brightness.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, brightness_adjusted_file_id]
mcp_tool: adjust_brightness
---

# Skill: Adjust Brightness

## Purpose
Adjust a clip's brightness — video only, audio is left bit-identical. This is an async
operation — poll `get_job_status` after calling.

## When to Use
- User says "brighten this up", "it's too dark", "make it lighter/darker"
- Simple exposure correction without full color grading

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `brightness` | number | No | `0.0` | Delta, -1.0 to 1.0. `0.0` is a true no-op |

## MCP Tool Call
```json
{
  "tool": "adjust_brightness",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "brightness": 0.3
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADJUST_BRIGHTNESS",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via `get_track` |

## Example
User: "This clip is too dark, brighten it up"
→ Call `get_track` → find clip's file_id
→ Call `adjust_brightness` with brightness=0.3
→ Poll until COMPLETED
→ "Done! The clip is now brighter."
