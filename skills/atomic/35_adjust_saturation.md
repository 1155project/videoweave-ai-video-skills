---
name: "adjust_saturation"
description: Adjust a clip's color saturation.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, saturation_adjusted_file_id]
mcp_tool: adjust_saturation
---

# Skill: Adjust Saturation

## Purpose
Adjust a clip's color saturation — video only, audio is left bit-identical. This is an
async operation — poll `get_job_status` after calling.

**Special case**: `saturation=0.0` produces a fully grayscale output — a common,
intentional creative choice, not an error.

## When to Use
- User says "make the colors pop", "mute the colors", "convert to black and white"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `saturation` | number | No | `1.0` | Multiplier, 0.0 to 3.0. `1.0` is a true no-op; `0.0` = grayscale |

## MCP Tool Call
```json
{
  "tool": "adjust_saturation",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "saturation": 0.0
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADJUST_SATURATION",
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
User: "Convert this clip to black and white"
→ Call `get_track` → find clip's file_id
→ Call `adjust_saturation` with saturation=0.0
→ Poll until COMPLETED
→ "Done! The clip is now grayscale."
