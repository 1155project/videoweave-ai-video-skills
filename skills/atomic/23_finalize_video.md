---
name: "finalize_video"
description: Join all timeline clips into a single final output video, with optional intro/outro/logo.
type: atomic
category: edit
async: true
requires: [project_id, at least one clip in track]
outputs: [job_id, output_file_id]
mcp_tool: finalize_video
---

# Skill: Finalize Video

## Purpose
Produce the final output video by joining all clips in the project timeline. Optionally
prepends an intro clip, appends an outro clip, and overlays a logo throughout. The result
is a new `OUTPUT` type file in the project. This is an async operation — poll
`get_job_status` after calling.

This is typically the last step in a project workflow.

## When to Use
- User says "finalize", "produce the final video", "export", "render"
- All editing is complete and the user wants the finished video

## Prerequisites
- `project_id` — from `list_projects`
- At least one clip in the timeline (`get_track` must return non-empty)
- Sufficient credits
- Intro/outro/logo files must be pre-set via the VideoWeave UI or API if desired
  (see `set-starter`, `set-ending`, `set-logo` endpoints — not currently MCP tools)

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project to finalize |
| `include_intro` | boolean | No | false | Prepend the account's default intro clip |
| `include_outro` | boolean | No | false | Append the account's default outro clip |
| `include_logo` | boolean | No | false | Overlay the account's default logo throughout |
| `transition_duration` | float | No | 0.5 | Seconds for transitions between clips |
| `transition_type` | string | No | `"NONE"` | `"NONE"`, `"FADE"`, or `"DISSOLVE"` |
| `output_resolution` | string | No | `"1080p"` | `"1080p"` or `"4k"`. `"4k"` requires a plan with 4K support and is capped at the highest native resolution among the project's clips — never upscaled beyond source. If sources don't support the requested tier, the job silently finalizes at the highest resolution the sources actually support. |

## MCP Tool Call
```json
{
  "tool": "finalize_video",
  "params": {
    "project_id": "uuid",
    "include_intro": true,
    "include_outro": true,
    "include_logo": false,
    "transition_type": "FADE",
    "transition_duration": 0.5
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "FINALIZE",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3–5 seconds until `COMPLETED` or `FAILED`.
Finalize jobs take longer than other operations (30 seconds to several minutes depending
on total video length and number of clips).

## After Completion
Once the job is `COMPLETED`, the output file is available in the project:
```
list_files → find file with file_type == "OUTPUT"
get_file_url → get download URL for the OUTPUT file
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits, or `output_resolution: "4k"` requested on a plan without 4K support | Inform user to purchase credits or upgrade their plan |
| 400 Bad Request | No clips in timeline | Verify with get_track that clips exist |
| FAILED job status | Processing error | Offer to retry; check if intro/outro files are set if those were enabled |

## Example
User: "Finalize the Summer Campaign project with a fade transition"
→ Call `get_track` → verify clips are present
→ Call `finalize_video` with `transition_type: "FADE"`
→ Poll `get_job_status` every 5s
→ Once COMPLETED: call `list_files`, find OUTPUT file
→ Call `get_file_url` for download link
→ "Your final video is ready! Download it here: https://... (link expires in 1 hour)"
