---
name: "enhance_video"
description: Apply a single quality-improvement pass combining color, sharpness, and noise reduction.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, enhanced_file_id]
mcp_tool: enhance_video
---

# Skill: Enhance Video

## Purpose
Apply a single, one-call quality-improvement pass combining color balance, sharpness,
and noise reduction — video only, audio is left bit-identical. This is an async
operation — poll `get_job_status` after calling.

**Different from calling `sharpen_video`/`denoise_video`/color tools separately**:
`enhance_video` combines all of it in ONE job, ONE re-encode, scaled by a single
`strength` parameter. Prefer this over chaining several individual quality/color tools
when the user just wants an overall "make this look better" improvement.

**Default is active, not a no-op**: unlike `adjust_brightness`/`sharpen_video`/etc.
(whose defaults are neutral), `enhance_video`'s default `strength=0.5` produces a
visible, moderate improvement — that's the point of the tool.

## When to Use
- User says "make this look better", "improve the quality", "enhance this clip", "clean this footage up overall"
- A quick one-call quality pass is wanted instead of manually tuning several separate operations

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to enhance, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to enhance |
| `strength` | number | No | `0.5` | Enhancement intensity, 0.0 to 1.0. `0.0` is a true no-op; `0.5` (default) is a moderate, visible improvement; `1.0` is maximum intensity |

## MCP Tool Call
```json
{
  "tool": "enhance_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "strength": 0.5
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ENHANCE_VIDEO",
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
User: "This clip looks flat and a bit noisy, can you just make it look better overall?"
→ Call `get_track` → find clip's file_id
→ Call `enhance_video` with strength=0.5 (or omit for the same default)
→ Poll until COMPLETED
→ "Done! The clip's color, sharpness, and noise have all been improved in one pass."
