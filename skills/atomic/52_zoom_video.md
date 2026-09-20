---
name: "zoom_video"
description: Animate a zoom from one level to another across the whole clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id, start_zoom, end_zoom]
outputs: [job_id, zoomed_file_id]
mcp_tool: zoom_video
---

# Skill: Zoom Video

## Purpose
Animate a zoom from `start_zoom` to `end_zoom`, centered on a focus point, smoothly
across the ENTIRE clip's duration — video only, audio is left in sync. This is an
async operation — poll `get_job_status` after calling.

**Important**: the zoom always animates across the whole clip — there is no way to
restrict it to only part of a longer clip (e.g. "only zoom during seconds 5-12"). If a
user asks for that, explain that the zoom applies to the entire clip; they may want to
`trim_clip` first to isolate the section they want zoomed.

## When to Use
- User says "zoom in on this clip", "add a slow zoom", "punch in over the clip"
- Emphasizing a subject or detail by gradually zooming toward it

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
| `focus_x` | number | No | `0.5` | Horizontal focus point, 0.0 (left) to 1.0 (right). `0.5` is centered |
| `focus_y` | number | No | `0.5` | Vertical focus point, 0.0 (top) to 1.0 (bottom). `0.5` is centered |

## MCP Tool Call
```json
{
  "tool": "zoom_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "start_zoom": 1.0,
    "end_zoom": 1.4,
    "focus_x": 0.5,
    "focus_y": 0.5
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ZOOM_VIDEO",
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
User: "Zoom in slowly on this clip from normal to 1.4x"
→ Call `get_track` → find clip's file_id
→ Call `zoom_video` with start_zoom=1.0, end_zoom=1.4
→ Poll until COMPLETED
→ "Done! The clip now has a smooth zoom-in across its whole duration."
