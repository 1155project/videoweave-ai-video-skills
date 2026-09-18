---
name: "deblock_video"
description: Reduce compression blockiness in a clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, deblocked_file_id]
mcp_tool: deblock_video
---

# Skill: Deblock Video

## Purpose
Reduce compression blockiness/artifacts in a clip — video only, audio is left
bit-identical. This is an async operation — poll `get_job_status` after calling.

**No tunable parameter** — unlike `sharpen_video`/`blur_video`/`denoise_video`, this
tool takes only `project_id`/`file_id`. There is no `amount` to set.

## When to Use
- User says "this clip has blocky artifacts", "it looks over-compressed", "clean up the compression artifacts"
- Source footage that was heavily compressed (e.g. re-encoded multiple times, or from
  a low-bitrate source) and shows visible square blocking, especially in flat/dark areas

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to deblock |

## MCP Tool Call
```json
{
  "tool": "deblock_video",
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
  "operation": "DEBLOCK_VIDEO",
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
User: "This clip has visible blocky compression artifacts, can you clean it up?"
→ Call `get_track` → find clip's file_id
→ Call `deblock_video` with just file_id (no other params)
→ Poll until COMPLETED
→ "Done! The compression blockiness has been reduced."
