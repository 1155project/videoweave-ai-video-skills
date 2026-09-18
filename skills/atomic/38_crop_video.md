---
name: "crop_video"
description: Crop a clip to a pixel rectangle.
type: atomic
category: edit
async: true
requires: [project_id, file_id, x, y, width, height]
outputs: [job_id, cropped_file_id]
mcp_tool: crop_video
---

# Skill: Crop Video

## Purpose
Crop a clip to a pixel rectangle — video only, audio is left bit-identical. This is an
async operation — poll `get_job_status` after calling.

**Strongly recommended**: call `get_media_info` first to learn the clip's actual pixel
dimensions (`video_streams[0].width`/`.height`) before computing the crop rectangle.
Coordinates are raw pixels, not normalized (0.0–1.0) values.

## When to Use
- User says "crop this to just the top-left quarter", "cut off the black bars", "reframe this for a different aspect ratio"
- Converting between aspect ratios (e.g. 16:9 landscape → 9:16 vertical) by cropping to the target rectangle

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to crop, from `get_track`
- The clip's pixel dimensions — call `get_media_info` first; do not guess
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to crop |
| `x` | integer | Yes | Left edge of the crop rectangle in pixels (≥ 0) |
| `y` | integer | Yes | Top edge of the crop rectangle in pixels (≥ 0) |
| `width` | integer | Yes | Crop rectangle width in pixels (> 0) |
| `height` | integer | Yes | Crop rectangle height in pixels (> 0) |

## MCP Tool Call
```json
{
  "tool": "crop_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "x": 100,
    "y": 50,
    "width": 640,
    "height": 480
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "CROP_VIDEO",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | Crop rectangle (`x + width` or `y + height`) exceeds the clip's known dimensions | Call `get_media_info` to confirm actual dimensions, then retry |
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via `get_track` |

**Note**: if the clip's dimensions were never recorded (older uploads), the bounds check
is skipped and the job proceeds — a genuinely invalid rectangle then fails the job
(status `FAILED`) instead of being rejected up front.

## Example
User: "Crop this clip to a 640x480 rectangle starting at 100,50"
→ Call `get_media_info` → confirm the clip is at least 740x530
→ Call `crop_video` with x=100, y=50, width=640, height=480
→ Poll until COMPLETED
→ "Done! The clip is now cropped to 640x480."
