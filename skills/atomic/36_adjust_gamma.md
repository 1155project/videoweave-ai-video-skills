---
name: "adjust_gamma"
description: Adjust a clip's gamma (midtone brightness).
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, gamma_adjusted_file_id]
mcp_tool: adjust_gamma
---

# Skill: Adjust Gamma

## Purpose
Adjust a clip's gamma — a midtone-focused brightness curve, distinct from the linear
`adjust_brightness` shift (gamma leaves pure black and pure white anchored while
compressing/expanding the tones in between). Video only, audio is left bit-identical.
This is an async operation — poll `get_job_status` after calling.

## When to Use
- User says "brighten the midtones without blowing out the highlights", "adjust gamma"
- `adjust_brightness` made shadows/highlights look wrong; gamma is the more surgical tool

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `gamma` | number | No | `1.0` | Value, 0.1 to 3.0. `1.0` is a true no-op; >1.0 brightens midtones, <1.0 darkens them |

## MCP Tool Call
```json
{
  "tool": "adjust_gamma",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "gamma": 1.8
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADJUST_GAMMA",
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
User: "The midtones in this clip look muddy, brighten them without blowing out the sky"
→ Call `get_track` → find clip's file_id
→ Call `adjust_gamma` with gamma=1.8
→ Poll until COMPLETED
→ "Done! The midtones are brighter and the highlights are unaffected."
