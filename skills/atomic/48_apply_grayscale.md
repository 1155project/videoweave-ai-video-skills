---
name: "apply_grayscale"
description: Convert a clip to grayscale.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, grayscale_file_id]
mcp_tool: apply_grayscale
---

# Skill: Apply Grayscale

## Purpose
Convert a clip to grayscale (fully desaturated, black & white) — video only, audio is
left bit-identical. This is an async operation — poll `get_job_status` after calling.

**No tunable parameter** — unlike `apply_vignette`/`pixelate_video`, this tool takes
only `project_id`/`file_id`.

**Equivalent to `adjust_saturation` with `saturation=0`**: this tool produces the exact
same result as calling `adjust_saturation(file_id, saturation=0)`. It exists as its own
named tool purely for discoverability — you're far more likely to look for "grayscale"
by name than to realize that `adjust_saturation`'s `saturation` parameter has a `0`
special case that achieves it. Either tool call is equally valid; use whichever you
find more naturally.

## When to Use
- User says "convert this to black and white", "make this grayscale", "remove the color"

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
  "tool": "apply_grayscale",
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
  "operation": "APPLY_GRAYSCALE",
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
User: "Convert this clip to black and white"
→ Call `get_track` → find clip's file_id
→ Call `apply_grayscale` with just file_id (no other params)
→ Poll until COMPLETED
→ "Done! The clip is now grayscale."
