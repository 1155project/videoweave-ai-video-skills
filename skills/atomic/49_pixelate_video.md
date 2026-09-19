---
name: "pixelate_video"
description: Apply a pixelation/mosaic effect to a clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, pixelated_file_id]
mcp_tool: pixelate_video
---

# Skill: Pixelate Video

## Purpose
Apply a pixelation/mosaic effect to a clip — video only, audio is left bit-identical.
This is an async operation — poll `get_job_status` after calling.

**Note**: this pixelates the WHOLE clip, not a specific region — there is no
region-masking parameter.

## When to Use
- User says "pixelate this", "add a mosaic effect", "blur out details with a blocky look"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `block_size` | integer | No | `1` | Pixelation block size, 1 to 64. `1` is a true no-op — larger values produce a blockier effect |

## MCP Tool Call
```json
{
  "tool": "pixelate_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "block_size": 16
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "PIXELATE_VIDEO",
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
User: "Pixelate this whole clip for a retro/mosaic look"
→ Call `get_track` → find clip's file_id
→ Call `pixelate_video` with block_size=16
→ Poll until COMPLETED
→ "Done! The clip is now pixelated."
