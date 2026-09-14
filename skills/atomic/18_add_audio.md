---
name: "add_audio"
description: Add or replace audio on a video clip with an uploaded audio file.
type: atomic
category: edit
async: true
requires: [project_id, file_id, audio_file_id]
outputs: [job_id, updated_file_id]
mcp_tool: add_audio
---

# Skill: Add Audio

## Purpose
Add an audio track to a video clip or replace its existing audio with an uploaded audio
file. The audio file must already be uploaded to the project as type `AUDIO`. This is
an async operation — poll `get_job_status` after calling.

## When to Use
- User wants to add background music to a clip
- User wants to replace the original audio with a voiceover
- User says "add audio", "add music", "add voiceover", "replace audio"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — the video clip to modify, from `get_track`
- `audio_file_id` — the audio file to add, from `list_files` (must be file_type `AUDIO`)
- Sufficient credits

If the audio file hasn't been uploaded yet, call `upload_file` first with `file_type: "AUDIO"`.

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Video clip to add audio to |
| `audio_file_id` | UUID string | Yes | — | Audio file to add (must be type AUDIO) |
| `start_time` | float | No | 0.0 | Where in the audio to start (seconds) |
| `audio_volume` | float | No | 1.0 | Volume level (0.0 = mute, 1.0 = full, 2.0 = double) |
| `loop_audio` | boolean | No | false | Loop the audio if shorter than the video |

## MCP Tool Call
```json
{
  "tool": "add_audio",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "audio_file_id": "uuid",
    "start_time": 0.0,
    "audio_volume": 0.8,
    "loop_audio": true
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADD_AUDIO",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Finding the Audio File
If the user refers to an audio file by name, call `list_files` and filter by `file_type: "AUDIO"`:
```json
// From list_files response, look for items where file_type == "AUDIO"
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 400 Bad Request | audio_file_id is not an AUDIO type | Verify via list_files |
| 404 Not Found | Video or audio file not found | Verify IDs |

## Example
User: "Add the background_music.mp3 to clip 2 at 80% volume"
→ Call `list_files` → find background_music.mp3, note its file_id (type AUDIO)
→ Call `get_track` → find clip 2's file_id
→ Call `add_audio` with `audio_volume: 0.8`
→ Poll until COMPLETED
→ "Done! Background music added to clip 2 at 80% volume."
