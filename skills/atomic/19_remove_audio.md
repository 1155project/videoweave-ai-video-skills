---
name: "remove_audio"
description: Strip audio from a video clip — all of it, or one specific track.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, silent_file_id]
mcp_tool: remove_audio
---

# Skill: Remove Audio

## Purpose
Remove audio from a video clip — either ALL audio (producing a silent video), or
one specific embedded audio stream when the clip has multiple (e.g. a multi-mic
recording or dual-language dub). The original clip is replaced in the timeline by
the result. This is an async operation — poll `get_job_status` after calling.

## When to Use
- User wants to mute a clip before adding different audio
- User says "remove audio", "mute", "strip audio", "silent video"
- Preparing a clip for a voiceover replacement (remove original, then add_audio)
- Clip has multiple audio tracks and the user wants to drop just one (e.g. "remove
  the second audio track" / "drop the commentary track, keep the music")

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to mute, from `get_track`
- If targeting a specific track: call `get_media_info` first to see how many audio
  streams the clip has and their type-relative indices
- Sufficient credits

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the clip |
| `file_id` | UUID string | Yes | Clip to strip audio from |
| `track_index` | integer | No | Type-relative audio stream index (0-based, see `get_media_info`) to remove. Omitted removes ALL audio (legacy behavior, unchanged). |

## MCP Tool Call
```json
{
  "tool": "remove_audio",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "track_index": 1
  }
}
```
Omit `track_index` to strip all audio (original behavior).

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "REMOVE_AUDIO",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Common Chain Pattern
To replace a clip's audio with a new track:
```
1. remove_audio    → mute the clip → poll until COMPLETED
2. add_audio       → add new audio file → poll until COMPLETED
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 404 Not Found | Clip not in track | Verify via get_track |
| 400 Bad Request | `track_index` out of range for this clip's audio streams | Call `get_media_info` to check the actual count before retrying |

## Example
User: "Mute clip 1"
→ Call `get_track` → find clip 1's file_id
→ Call `remove_audio`
→ Poll until COMPLETED
→ "Done! Audio has been removed from clip 1."
