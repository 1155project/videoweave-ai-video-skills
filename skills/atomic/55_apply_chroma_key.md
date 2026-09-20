---
name: "apply_chroma_key"
description: Composite a green-screen or blue-screen clip onto a background image, removing the selected key color.
type: atomic
category: edit
async: true
requires: [project_id, file_id, background_file_id]
outputs: [job_id, composited_file_id]
mcp_tool: apply_chroma_key
---

# Skill: Apply Chroma Key

## Purpose
Remove a green or blue screen from a foreground clip and composite it onto a background
image — video only, audio from the foreground clip is preserved. This is an async
operation — poll `get_job_status` after calling.

**Important**: only still images are supported as the background for now — video
backgrounds are not yet supported. If a user wants to composite onto a video
background, explain that only image backgrounds work today.

## When to Use
- User says "remove the green screen", "replace my background", "composite this onto a background image"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — the green/blue-screen clip to key, from `get_track`
- `background_file_id` — an image file uploaded with `file_type=BACKGROUND` via
  `prepare_upload` (see the "File types matter" section of `CLAUDE.md`)
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Green/blue-screen clip to key |
| `background_file_id` | UUID string | Yes | — | Background image (file_type BACKGROUND) |
| `key_color` | string | No | `"green"` | `"green"` or `"blue"` — the screen color to remove |
| `similarity` | number | No | `0.3` | How broadly to match the key color, 0.01 (exact color only) to 1.0 (matches everything) |
| `blend` | number | No | `0.1` | Edge softness between kept and removed pixels, 0.0 (hard edge) to 1.0 (very soft) |

## MCP Tool Call
```json
{
  "tool": "apply_chroma_key",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "background_file_id": "uuid",
    "key_color": "green",
    "similarity": 0.3,
    "blend": 0.1
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "APPLY_CHROMA_KEY",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip or background not in project | Verify via `get_track`/`list_files` |

## Example
User: "Remove the green screen from this clip and put it in front of my background image"
→ Call `get_track` → find the clip's `file_id`
→ Upload the background image with `prepare_upload` (`file_type=BACKGROUND`), then `confirm_upload`
→ Call `apply_chroma_key` with `file_id`, `background_file_id`, `key_color="green"`
→ Poll until COMPLETED
→ "Done! The green screen has been replaced with your background image."
