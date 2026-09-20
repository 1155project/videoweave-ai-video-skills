---
name: "pan_video"
description: Pan across the frame in one direction at a fixed zoom level, animated across the whole clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id, direction, distance]
outputs: [job_id, panned_file_id]
mcp_tool: pan_video
---

# Skill: Pan Video

## Purpose
Pan (move the visible window) across the frame in one direction at a fixed, moderate
zoom level, animated smoothly across the ENTIRE clip's duration — video only, audio is
left in sync. This is an async operation — poll `get_job_status` after calling.

**Important**: the pan always animates across the whole clip — there is no way to
restrict it to only part of a longer clip. If a user asks for that, explain that the
pan applies to the entire clip; they may want to `trim_clip` first to isolate the
section they want panned.

**Different from `zoom_video`**: `pan_video` keeps zoom fixed and moves the visible
window; `zoom_video` keeps the frame centered and animates the zoom level itself. Use
`ken_burns_video` if you want both together.

## When to Use
- User says "pan across this clip", "slide the view left to right", "add a panning motion"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to adjust |
| `direction` | string | Yes | `"left"`, `"right"`, `"up"`, or `"down"` |
| `distance` | number | Yes | How far to pan across the available range, 0.0 (no motion) to 1.0 (full range) |

## MCP Tool Call
```json
{
  "tool": "pan_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "direction": "right",
    "distance": 1.0
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "PAN_VIDEO",
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
User: "Add a pan from left to right across this clip"
→ Call `get_track` → find clip's file_id
→ Call `pan_video` with direction="right", distance=1.0
→ Poll until COMPLETED
→ "Done! The clip now pans left to right across its whole duration."
