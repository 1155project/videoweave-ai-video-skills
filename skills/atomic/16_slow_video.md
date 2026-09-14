---
name: "slow_video"
description: Slow down a video clip by a factor of 2x, 3x, or 4x.
type: atomic
category: edit
async: true
requires: [project_id, file_id, factor]
outputs: [job_id, slowed_file_id]
mcp_tool: slow_video
---

# Skill: Slow Video

## Purpose
Slow down a video clip. The original clip is replaced in the timeline by the slowed
version. Audio pitch is preserved by default. This is an async operation — poll
`get_job_status` after calling.

## When to Use
- User says "slow down", "slow motion", "stretch", or "make slower"
- Creating dramatic slow-motion effect for key moments

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to slow, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to slow down |
| `factor` | integer | Yes | Slow-down multiplier: `2`, `3`, or `4` (2 = half speed, 4 = quarter speed) |

## MCP Tool Call
```json
{
  "tool": "slow_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "factor": 2
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "STRETCH",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Factor Guide
| Factor | Result |
|---|---|
| 2 | Half speed (2x slower) |
| 3 | One-third speed (3x slower) |
| 4 | Quarter speed (4x slower) |

If the user says "half speed", use factor 2. If they say "slow motion", ask which
factor (2x, 3x, or 4x), or default to 2x.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 400 Bad Request | Invalid factor | Factor must be 2, 3, or 4 |
| 404 Not Found | File not in track | Verify via get_track |

## Example
User: "Make the third clip slow motion"
→ Ask: "How slow — 2x, 3x, or 4x slower?" (or default to 2x)
→ Call `get_track` → find clip 3's file_id
→ Call `slow_video` with `factor: 2`
→ Poll until COMPLETED
→ "Done! Clip 3 is now in 2x slow motion."
