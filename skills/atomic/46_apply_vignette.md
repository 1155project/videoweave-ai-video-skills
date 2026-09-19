---
name: "apply_vignette"
description: Apply a vignette effect (darkened edges) to a clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, vignetted_file_id]
mcp_tool: apply_vignette
---

# Skill: Apply Vignette

## Purpose
Apply a vignette effect (darkened corners/edges, drawing attention to the center of the
frame) to a clip — video only, audio is left bit-identical. This is an async operation —
poll `get_job_status` after calling.

## When to Use
- User says "add a vignette", "darken the edges", "give this a cinematic border look"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `strength` | number | No | `0.0` | Vignette strength, 0.0 to 1.0. `0.0` is a true no-op |

## MCP Tool Call
```json
{
  "tool": "apply_vignette",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "strength": 0.6
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "APPLY_VIGNETTE",
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
User: "Add a subtle vignette to this clip for a more cinematic feel"
→ Call `get_track` → find clip's file_id
→ Call `apply_vignette` with strength=0.4
→ Poll until COMPLETED
→ "Done! The clip now has a vignette effect."
