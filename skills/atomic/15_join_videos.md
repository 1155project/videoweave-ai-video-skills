---
name: "join_videos"
description: Merge multiple video clips into a single clip with optional transitions.
type: atomic
category: edit
async: true
requires: [project_id, file_ids (2+), transition settings]
outputs: [job_id, merged_file_id]
mcp_tool: join_videos
---

# Skill: Join Videos

## Purpose
Combine two or more clips from the project timeline into a single merged clip. The
source clips are removed from the timeline and replaced by the merged result. This is
an async operation — poll `get_job_status` after calling.

## When to Use
- User wants to merge clips together
- User says "join", "merge", "combine" clips
- Consolidating a series of short clips into one before applying an effect

## Prerequisites
- `project_id` — from `list_projects`
- `file_ids` — array of 2 or more `file_id` values from `get_track`; all clips must be in the timeline
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clips |
| `video_ids` | UUID[] | Yes | — | Ordered list of file_ids to join (in desired sequence) |
| `transition_duration` | float | No | 0.5 | Transition length in seconds (0.0–2.0) |
| `transition_type` | string | No | `"NONE"` | `"NONE"`, `"FADE"`, or `"DISSOLVE"` |

## MCP Tool Call
```json
{
  "tool": "join_videos",
  "params": {
    "project_id": "uuid",
    "video_ids": ["uuid-clip1", "uuid-clip2", "uuid-clip3"],
    "transition_duration": 0.5,
    "transition_type": "FADE"
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "JOIN",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.
After completion, call `get_track` to see the merged clip.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user to purchase more credits |
| 400 Bad Request | Fewer than 2 clips provided | Verify video_ids has at least 2 entries |
| 404 Not Found | One or more file_ids not in track | Verify all IDs via get_track |
| FAILED job status | Processing error | Offer to retry |

## Example
User: "Merge clips 1, 2, and 3 with a fade transition"
→ Call `get_track` → collect file_ids for positions 1, 2, 3
→ Call `join_videos` with those IDs and `transition_type: "FADE"`
→ Poll `get_job_status` → COMPLETED
→ "Merged! Your 3 clips are now a single clip in the timeline."
