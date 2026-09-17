---
name: "adjust_white_balance"
description: Adjust a clip's color balance via per-channel gamma.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, white_balance_adjusted_file_id]
mcp_tool: adjust_white_balance
---

# Skill: Adjust White Balance

## Purpose
Adjust a clip's color balance by independently boosting or reducing the red, green, and
blue channels — a simple way to correct a color cast (too warm/orange or too cool/blue)
or add one intentionally. Video only, audio is left bit-identical. This is a per-channel
adjustment, not shadow/midtone/highlight-specific grading — a first-pass color balance
tool, not full color grading. This is an async operation — poll `get_job_status` after
calling.

## When to Use
- User says "this looks too orange/blue", "warm this up", "cool this down", "fix the color cast"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to adjust |
| `red` | number | No | `1.0` | Red channel gamma, 0.1 to 3.0. `1.0` is a true no-op |
| `green` | number | No | `1.0` | Green channel gamma, 0.1 to 3.0. `1.0` is a true no-op |
| `blue` | number | No | `1.0` | Blue channel gamma, 0.1 to 3.0. `1.0` is a true no-op |

All three channels default to `1.0` (neutral) — set only the channel(s) you want to shift.

## MCP Tool Call
```json
{
  "tool": "adjust_white_balance",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "red": 1.3,
    "blue": 0.8
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADJUST_WHITE_BALANCE",
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
User: "This clip has a blue tint, warm it up"
→ Call `get_track` → find clip's file_id
→ Call `adjust_white_balance` with red=1.3, blue=0.8
→ Poll until COMPLETED
→ "Done! The clip now has a warmer color balance."
