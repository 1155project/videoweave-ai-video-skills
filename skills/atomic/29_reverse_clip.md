---
name: "reverse_clip"
description: Reverse a clip's playback — video and audio together.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, reversed_file_id]
mcp_tool: reverse_clip
---

# Skill: Reverse Clip

## Purpose
Reverse a clip's playback direction — video and audio both play backwards. This is
an async operation — poll `get_job_status` after calling.

## When to Use
- User says "reverse this clip", "play it backwards"
- Creative effect for an intro/outro or highlight

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to reverse, from `get_track`
- Sufficient credits
- Clip should be reasonably short (see gotcha below)

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to reverse |

## MCP Tool Call
```json
{
  "tool": "reverse_clip",
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
  "operation": "REVERSE_CLIP",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`. Reverse can take
longer than other operations on longer clips — reversing requires buffering the entire
clip in memory (there is no streaming/chunked reverse).

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | Clip exceeds the maximum duration for reverse (~15 minutes) | Trim the clip first, or inform the user this clip is too long to reverse |
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via `get_track` |

## Example
User: "Reverse clip 3"
→ Call `get_track` → find clip 3's file_id
→ Call `reverse_clip`
→ Poll until COMPLETED
→ "Done! Clip 3 now plays in reverse."
