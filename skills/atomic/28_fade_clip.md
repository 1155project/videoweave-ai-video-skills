---
name: "fade_clip"
description: Fade a clip in and/or out — video and audio together.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, faded_file_id]
mcp_tool: fade_clip
---

# Skill: Fade Clip

## Purpose
Fade a clip in at the start, out at the end, or both — video and audio fade together
in one pass. This is an async operation — poll `get_job_status` after calling.

## When to Use
- User says "fade this in", "fade out at the end", "add a fade"
- Smoothing the start/end of a clip that will sit at the very beginning or end of the
  final video (where a join transition to another clip doesn't apply)

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to fade, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to fade |
| `fade_type` | string | No | `"both"` | `"in"`, `"out"`, or `"both"` |
| `duration` | number | No | `1.0` | Fade duration in seconds (max 10.0) |

## MCP Tool Call
```json
{
  "tool": "fade_clip",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "fade_type": "both",
    "duration": 1.0
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "FADE_CLIP",
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
User: "Fade clip 1 in over the first second"
→ Call `get_track` → find clip 1's file_id
→ Call `fade_clip` with fade_type="in", duration=1.0
→ Poll until COMPLETED
→ "Done! Clip 1 now fades in over the first second."
