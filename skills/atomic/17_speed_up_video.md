---
name: "speed_up_video"
description: Speed up a video clip by a factor of 2x or 3x.
type: atomic
category: edit
async: true
requires: [project_id, file_id, factor]
outputs: [job_id, sped_up_file_id]
mcp_tool: speed_up_video
---

# Skill: Speed Up Video

## Purpose
Speed up a video clip. The original clip is replaced in the timeline by the faster
version. This is an async operation — poll `get_job_status` after calling.

## When to Use
- User says "speed up", "faster", "timelapse", "make quicker"
- Condensing long recordings or b-roll footage

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to speed up, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to speed up |
| `factor` | integer | Yes | Speed multiplier: `2` or `3` (2 = double speed, 3 = triple speed) |

## MCP Tool Call
```json
{
  "tool": "speed_up_video",
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
  "operation": "SPEEDUP",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Factor Guide
| Factor | Result |
|---|---|
| 2 | Double speed (2x faster) |
| 3 | Triple speed (3x faster) |

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 400 Bad Request | Invalid factor | Factor must be 2 or 3 (not 4 — that's for slow_video) |
| 404 Not Found | File not in track | Verify via get_track |

## Example
User: "Speed up the second clip 2x"
→ Call `get_track` → find clip 2's file_id
→ Call `speed_up_video` with `factor: 2`
→ Poll until COMPLETED
→ "Done! Clip 2 is now playing at double speed."
