---
name: "adjust_contrast"
description: Adjust a clip's contrast.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, contrast_adjusted_file_id]
mcp_tool: adjust_contrast
---

# Skill: Adjust Contrast

## Purpose
Adjust a clip's contrast — video only, audio is left bit-identical. This is an async
operation — poll `get_job_status` after calling.

## When to Use
- User says "make this pop more", "it looks flat/washed out", "increase/decrease contrast"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `contrast` | number | No | `1.0` | Multiplier, 0.0 to 3.0. `1.0` is a true no-op |

## MCP Tool Call
```json
{
  "tool": "adjust_contrast",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "contrast": 1.5
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADJUST_CONTRAST",
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
User: "This clip looks flat, punch up the contrast"
→ Call `get_track` → find clip's file_id
→ Call `adjust_contrast` with contrast=1.5
→ Poll until COMPLETED
→ "Done! The clip now has more contrast."
