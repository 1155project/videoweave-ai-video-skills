---
name: "convert_frame_rate"
description: Convert a clip to a target frame rate by duplicating or dropping frames; playback speed and duration are unchanged.
type: atomic
category: edit
async: true
requires: [project_id, file_id, target_fps]
outputs: [job_id, converted_file_id]
mcp_tool: convert_frame_rate
---

# Skill: Convert Frame Rate

## Purpose
Resample a clip to a target frame rate (e.g. 24, 29.97, 30, 60) by duplicating or
dropping frames as needed — video only, audio is left untouched, and the clip's
playback speed and total duration are unchanged. This is an async operation — poll
`get_job_status` after calling.

**Different from `slow_video`/`speed_up_video`**: those tools change how fast the clip
*plays back* (and therefore its duration). `convert_frame_rate` only changes how many
frames per second are stored — the clip still plays at the same speed and takes the
same amount of time. If a user actually wants the clip to play faster or slower, use
`slow_video`/`speed_up_video` instead.

## When to Use
- User says "convert this to 30fps", "match the frame rate of my other clips", "this footage is 60fps but I need 24fps"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to convert, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to convert |
| `target_fps` | number | Yes | Target frame rate, greater than 0 and up to 120 (e.g. 24, 25, 29.97, 30, 60) |

## MCP Tool Call
```json
{
  "tool": "convert_frame_rate",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "target_fps": 30
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "CONVERT_FRAME_RATE",
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
User: "This clip is 60fps but the rest of my project is 30fps, can you fix it?"
→ Call `get_track` → find clip's file_id
→ Call `convert_frame_rate` with target_fps=30
→ Poll until COMPLETED
→ "Done! The clip is now 30fps, matching the rest of your project."
