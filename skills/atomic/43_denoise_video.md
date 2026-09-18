---
name: "denoise_video"
description: Reduce noise/grain in a clip.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, denoised_file_id]
mcp_tool: denoise_video
---

# Skill: Denoise Video

## Purpose
Reduce noise/grain in a clip — video only, audio is left bit-identical. This is an
async operation — poll `get_job_status` after calling.

## When to Use
- User says "this footage is grainy", "clean up the noise", "this looks noisy from low light"
- Low-light or high-ISO source footage with visible sensor grain

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to denoise |
| `amount` | number | No | `0.0` | Denoise amount, 0.0 to 3.0. `0.0` is a true no-op |

## MCP Tool Call
```json
{
  "tool": "denoise_video",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "amount": 1.5
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "DENOISE_VIDEO",
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
User: "This clip was shot in low light and looks grainy, clean it up"
→ Call `get_track` → find clip's file_id
→ Call `denoise_video` with amount=1.5
→ Poll until COMPLETED
→ "Done! The clip's noise/grain has been reduced."
