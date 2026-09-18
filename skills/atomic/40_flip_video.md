---
name: "flip_video"
description: Mirror a clip horizontally or vertically.
type: atomic
category: edit
async: true
requires: [project_id, file_id, direction]
outputs: [job_id, flipped_file_id]
mcp_tool: flip_video
---

# Skill: Flip Video

## Purpose
Mirror a clip horizontally or vertically — video only, audio is left bit-identical.
This is an async operation — poll `get_job_status` after calling.

**Different from `rotate_video`**: flipping mirrors the image (like a reflection);
rotating turns it. `direction="horizontal"` mirrors left-right (like a mirror image);
`direction="vertical"` mirrors top-bottom (upside down, but not rotated).

## When to Use
- User says "mirror this clip", "flip it horizontally", "this looks backwards"
- Correcting footage that was recorded with a front-facing camera (common mirroring issue)

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to flip, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to flip |
| `direction` | string | Yes | `"horizontal"` (mirror left-right) or `"vertical"` (mirror top-bottom) |

## MCP Tool Call
```json
{
  "tool": "flip_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "direction": "horizontal"
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "FLIP_VIDEO",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | `direction` is not `"horizontal"` or `"vertical"` | Use one of the two supported values |
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via `get_track` |

## Example
User: "This clip looks like a mirror image, can you flip it back?"
→ Call `get_track` → find clip's file_id
→ Call `flip_video` with direction="horizontal"
→ Poll until COMPLETED
→ "Done! The clip has been mirrored horizontally."
