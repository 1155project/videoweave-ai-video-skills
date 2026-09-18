---
name: "blur_video"
description: Blur a clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, blurred_file_id]
mcp_tool: blur_video
---

# Skill: Blur Video

## Purpose
Blur a clip — video only, audio is left bit-identical. This is an async operation —
poll `get_job_status` after calling.

## When to Use
- User says "blur this out", "soften this footage", "add a blur effect"
- Obscuring a background or a sensitive area (note: this blurs the WHOLE clip, not a
  specific region — there is no region-masking parameter)

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to blur |
| `amount` | number | No | `0.0` | Blur amount, 0.0 to 20.0. `0.0` is a true no-op |

## MCP Tool Call
```json
{
  "tool": "blur_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "amount": 10.0
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "BLUR_VIDEO",
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
User: "Blur this whole clip for a dreamy effect"
→ Call `get_track` → find clip's file_id
→ Call `blur_video` with amount=10.0
→ Poll until COMPLETED
→ "Done! The clip is now blurred."
