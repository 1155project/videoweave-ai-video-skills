---
name: "apply_sepia"
description: Apply a sepia tone to a clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, sepia_file_id]
mcp_tool: apply_sepia
---

# Skill: Apply Sepia

## Purpose
Apply a sepia (warm brownish) tone to a clip — video only, audio is left bit-identical.
This is an async operation — poll `get_job_status` after calling.

**No tunable parameter** — unlike `apply_vignette`/`pixelate_video`, this tool takes
only `project_id`/`file_id`.

## When to Use
- User says "give this an old/vintage look", "add a sepia tone", "make this look like an old photo"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to adjust |

## MCP Tool Call
```json
{
  "tool": "apply_sepia",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "APPLY_SEPIA",
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
User: "Give this clip an old-fashioned sepia look"
→ Call `get_track` → find clip's file_id
→ Call `apply_sepia` with just file_id (no other params)
→ Poll until COMPLETED
→ "Done! The clip now has a sepia tone."
