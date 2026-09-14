---
name: "trim_clip"
description: Extract a [start_time, end_time] sub-segment of a clip as one new clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id, start_time, end_time]
outputs: [job_id, trimmed_file_id]
mcp_tool: trim_clip
---

# Skill: Trim Clip

## Purpose
Extract a `[start_time, end_time]` window of a clip as a single new clip. This is an
async operation — poll `get_job_status` after calling.

**Different from `cut_video`**: `cut_video` splits a clip into TWO output clips at one
timestamp (keep both halves). `trim_clip` produces ONE output containing only the
requested window (discard everything outside it).

## When to Use
- User says "trim this to just the first 10 seconds", "keep only 0:05 to 0:20"
- Removing dead air/unwanted footage from the start or end of a clip in one step
  (versus cutting twice and discarding two of the three resulting pieces)

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to trim, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to trim |
| `start_time` | number | Yes | Start of the segment, in seconds |
| `end_time` | number | Yes | End of the segment, in seconds — must be greater than `start_time` |

## MCP Tool Call
```json
{
  "tool": "trim_clip",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "start_time": 2.0,
    "end_time": 5.0
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "TRIM_CLIP",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | `end_time` <= `start_time` | Fix the request — end must be strictly after start |
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via `get_track` |

## Example
User: "Trim clip 1 to just the middle 3 seconds, from 2s to 5s"
→ Call `get_track` → find clip 1's file_id
→ Call `trim_clip` with start_time=2.0, end_time=5.0
→ Poll until COMPLETED
→ "Done! The clip is now trimmed to the 2s–5s window."
