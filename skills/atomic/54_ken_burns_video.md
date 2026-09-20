---
name: "ken_burns_video"
description: Apply an animated zoom-and-pan (Ken Burns) effect to a clip, across the whole clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id, start_zoom, end_zoom]
outputs: [job_id, ken_burns_file_id]
mcp_tool: ken_burns_video
---

# Skill: Ken Burns Video

## Purpose
Apply the classic combined animated zoom + pan ("Ken Burns") effect to a clip in one
call — video only, audio is left in sync. Animates smoothly across the ENTIRE clip's
duration. This is an async operation — poll `get_job_status` after calling.

**Important**: the effect always animates across the whole clip — there is no way to
restrict it to only part of a longer clip. If a user asks for that, explain that the
effect applies to the entire clip; they may want to `trim_clip` first to isolate the
section they want.

**Different from calling `zoom_video`/`pan_video` separately**: `ken_burns_video`
combines both in ONE call and ONE re-encode, which is the classic, most-requested
"Ken Burns" look (especially for photo-to-video and highlight-reel use cases). Use the
individual `zoom_video`/`pan_video` tools instead if you only want one dimension of
motion, or want independent control over pan distance.

## When to Use
- User says "add a Ken Burns effect", "give this the classic photo-zoom-pan look", "animate this clip"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `start_zoom` | number | Yes | — | Zoom level at the start of the clip, 1.0 to 3.0 |
| `end_zoom` | number | Yes | — | Zoom level at the end of the clip, 1.0 to 3.0 |
| `pan_direction` | string | No | `"right"` | `"left"`, `"right"`, `"up"`, or `"down"` |

## MCP Tool Call
```json
{
  "tool": "ken_burns_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "start_zoom": 1.0,
    "end_zoom": 1.3,
    "pan_direction": "right"
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "KEN_BURNS_VIDEO",
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
User: "Give this clip the classic Ken Burns zoom and pan effect"
→ Call `get_track` → find clip's file_id
→ Call `ken_burns_video` with start_zoom=1.0, end_zoom=1.3 (pan_direction defaults to "right")
→ Poll until COMPLETED
→ "Done! The clip now has a combined Ken Burns zoom-and-pan effect across its whole duration."
