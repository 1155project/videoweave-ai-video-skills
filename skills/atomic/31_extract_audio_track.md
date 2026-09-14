---
name: "extract_audio_track"
description: Save one audio stream from a clip as a standalone AUDIO file.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, audio_file_id]
mcp_tool: extract_audio_track
---

# Skill: Extract Audio Track

## Purpose
Save one specific audio stream from a video clip as a brand-new, standalone AUDIO
file in the project. **This does NOT modify the source clip** — unlike every other
edit operation in this catalogue, the original video is left completely untouched;
this only adds a new file. This is an async operation — poll `get_job_status` after
calling.

## When to Use
- User wants to reuse a clip's audio elsewhere (e.g. as background music via `add_audio`
  on a different clip)
- User wants to keep a copy of a specific audio track before removing it with `remove_audio`
- Clip has multiple audio tracks (e.g. dual-language dub) and the user wants to pull
  one out as its own file

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to extract from, from `get_track`
- If the clip has multiple audio streams: call `get_media_info` first to find the
  correct `track_index`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to extract audio from |
| `track_index` | integer | No | `0` | Type-relative audio stream index to extract (0-based, see `get_media_info`) |

## MCP Tool Call
```json
{
  "tool": "extract_audio_track",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "track_index": 0
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "EXTRACT_AUDIO_TRACK",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`. Once complete,
call `list_files` to find the new `file_type == "AUDIO"` file — it does NOT
automatically appear on the timeline; use `add_clip_to_track` or `add_audio` with it
separately if desired.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | `track_index` out of range (or clip has no audio at all) | Call `get_media_info` first to check the actual track count |
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via `get_track` |

## Example
User: "Save the audio from clip 4 as its own file so I can reuse it later"
→ Call `get_track` → find clip 4's file_id
→ Call `get_media_info` → confirm it has 1 audio stream at index 0
→ Call `extract_audio_track` with track_index=0
→ Poll until COMPLETED
→ Call `list_files` → find the new AUDIO file
→ "Done! The audio is saved as a standalone file — clip 4 itself is unchanged."
