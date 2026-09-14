---
name: "add_logo"
description: Overlay a logo or watermark image on a video clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id, logo_file_id]
outputs: [job_id, watermarked_file_id]
mcp_tool: add_logo
---

# Skill: Add Logo

## Purpose
Overlay a logo image (PNG or JPG) on a video clip as a watermark. The logo is composited
at a specified position with optional padding and size adjustments. The original clip is
replaced in the timeline by the watermarked version. This is an async operation — poll
`get_job_status` after calling.

## When to Use
- User wants to add a watermark or brand logo to a clip
- User says "add logo", "add watermark", "brand the video"
- Applying consistent branding across multiple clips before finalizing

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — video clip to watermark, from `get_track`
- `logo_file_id` — the logo image, from `list_files` (must be file_type `LOGO`)
- Sufficient credits

If the logo hasn't been uploaded yet, call `upload_file` first with `file_type: "LOGO"`.

## Position Reference
```
top-left      top-center      top-right
middle-left   center          middle-right
bottom-left   bottom-center   bottom-right
```

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Video clip to apply logo to |
| `logo_id` | UUID string | Yes | — | Logo image file (must be type LOGO) |
| `position` | string | No | `"bottom-right"` | Logo placement (see Position Reference above) |
| `padding` | integer | No | 10 | Pixels of padding from the edge |
| `logo_size` | integer | No | 100 | Logo width in pixels (height scales proportionally) |

## MCP Tool Call
```json
{
  "tool": "add_logo",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "logo_id": "uuid",
    "position": "bottom-right",
    "padding": 15,
    "logo_size": 120
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADD_LOGO",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Finding the Logo File
Call `list_files` and filter for `file_type: "LOGO"` to find available logo images.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 400 Bad Request | logo_id is not a LOGO type file | Verify via list_files |
| 404 Not Found | Video or logo file not found | Verify IDs |

## Example
User: "Add the company logo to the bottom-right of clip 2"
→ Call `list_files` → find logo file, note file_id (type LOGO)
→ Call `get_track` → find clip 2's file_id
→ Call `add_logo` with `position: "bottom-right"`
→ Poll until COMPLETED
→ "Done! Company logo added to the bottom-right of clip 2."
