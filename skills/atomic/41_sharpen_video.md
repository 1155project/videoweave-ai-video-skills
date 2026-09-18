---
name: "sharpen_video"
description: Sharpen a clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, sharpened_file_id]
mcp_tool: sharpen_video
---

# Skill: Sharpen Video

## Purpose
Sharpen a clip — video only, audio is left bit-identical. This is an async operation —
poll `get_job_status` after calling.

## When to Use
- User says "this looks soft/out of focus", "sharpen this up", "add some crispness"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to sharpen |
| `amount` | number | No | `0.0` | Sharpen amount, 0.0 to 5.0. `0.0` is a true no-op |

## MCP Tool Call
```json
{
  "tool": "sharpen_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "amount": 2.0
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "SHARPEN_VIDEO",
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
User: "This clip looks a bit soft, sharpen it up"
→ Call `get_track` → find clip's file_id
→ Call `sharpen_video` with amount=2.0
→ Poll until COMPLETED
→ "Done! The clip is now sharper."
