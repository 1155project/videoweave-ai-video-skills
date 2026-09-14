---
name: "cut_video"
description: Split a video clip at a specific timestamp, creating two separate clips.
type: atomic
category: edit
async: true
requires: [project_id, file_id, timestamp]
outputs: [job_id, two_new_file_ids]
mcp_tool: cut_video
---

# Skill: Cut Video

## Purpose
Split a clip at a specific timestamp into two clips. The original clip is replaced in
the timeline by the two resulting clips. This is an async operation — you must poll
`get_job_status` after calling.

## When to Use
- User wants to split a clip into two parts
- User wants to trim the beginning or end of a clip (cut, then remove the unwanted part)
- User says "cut at [time]", "split at [time]", "trim at [time]"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — the clip to cut, from `get_track` (clip must be in the timeline)
- Sufficient credits — check with `get_account_info` if unsure

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to cut |
| `timestamp` | string | Yes | Where to cut in `HH:MM:SS` or `MM:SS` format (e.g., `"00:01:30"`) |

## MCP Tool Call
```json
{
  "tool": "cut_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "timestamp": "00:01:30"
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "CUT",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
After calling `cut_video`, you MUST poll `get_job_status` until status is `COMPLETED` or `FAILED`:

```json
{
  "tool": "get_job_status",
  "params": {
    "project_id": "uuid",
    "job_id": "uuid"
  }
}
```

Poll every 3 seconds. Typical completion time: 5–20 seconds.

Once `COMPLETED`, call `get_track` to see the two resulting clips in the timeline.

## Output for Chaining
After completion, call `get_track` to get the `file_id` values of the two new clips.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user to purchase more credits |
| 404 Not Found | Project or file not found | Verify IDs via get_track |
| 400 Bad Request | Timestamp beyond clip duration | Ask user to confirm the correct timestamp |
| FAILED job status | Processing error | Offer to retry with `retry_job` |

## Example
User: "Cut the intro clip at 45 seconds"
→ Call `get_track` → find "intro clip" file_id
→ Call `cut_video` with `timestamp: "00:00:45"` → get job_id
→ Poll `get_job_status` every 3s → COMPLETED
→ Call `get_track` → show user the two resulting clips
→ "Done! Your intro clip was split into two parts at 0:45."
