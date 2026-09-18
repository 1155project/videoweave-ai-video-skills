---
name: "rotate_video"
description: Rotate a clip by 90, 180, or 270 degrees.
type: atomic
category: edit
async: true
requires: [project_id, file_id, degrees]
outputs: [job_id, rotated_file_id]
mcp_tool: rotate_video
---

# Skill: Rotate Video

## Purpose
Rotate a clip by exactly 90, 180, or 270 degrees — video only, audio is left
bit-identical. This is an async operation — poll `get_job_status` after calling.

**Only these three angles are supported.** Arbitrary-angle rotation (e.g. "rotate 37
degrees") is not available — if a user asks for a non-90-degree-multiple rotation,
explain that only 90/180/270 are supported and ask if one of those solves their need.

**Dimension swap**: rotating by 90 or 270 degrees swaps width and height (e.g. a
1920x1080 clip becomes 1080x1920). This is expected, correct behavior, not an error.

## When to Use
- User says "this footage is sideways", "rotate this 90 degrees", "flip this right-side up"
- Fixing portrait footage that was recorded and uploaded in the wrong orientation

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to rotate, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to rotate |
| `degrees` | integer | Yes | Rotation angle: exactly `90`, `180`, or `270` |

## MCP Tool Call
```json
{
  "tool": "rotate_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "degrees": 90
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ROTATE_VIDEO",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | `degrees` is not one of 90/180/270 | Use one of the three supported angles |
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via `get_track` |

## Example
User: "This clip is sideways, it should be portrait"
→ Call `get_track` → find clip's file_id
→ Call `rotate_video` with degrees=90
→ Poll until COMPLETED
→ "Done! The clip is now rotated 90 degrees."
