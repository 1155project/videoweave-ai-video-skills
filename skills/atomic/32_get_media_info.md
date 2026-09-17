---
name: "get_media_info"
description: List every video and audio stream in a file (codecs, resolution, channels, language).
type: atomic
category: files
async: false
requires: [project_id, file_id]
outputs: [duration, video_streams, audio_streams]
mcp_tool: get_media_info
---

# Skill: Get Media Info

## Purpose
List every video and audio stream in a file — codec, resolution or channels/sample rate,
and language tag if present. This is a **free, synchronous** call (a direct media
inspection, no background job) — do NOT poll `get_job_status` after this.

`get_track` is a different thing: it returns the project's **timeline clip order**.
`get_media_info` returns the **stream-level detail inside one file**.

## When to Use
- User asks "how many audio tracks does this clip have?" or "what's in this file?"
- Before calling `remove_audio` with a `track_index` or `extract_audio_track` — always
  check the actual track indices first rather than guessing
- Verifying a clip's codec/resolution before another operation

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files` or `get_track`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to inspect |

## MCP Tool Call
```json
{
  "tool": "get_media_info",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Response (200 — Synchronous, no job)
```json
{
  "duration": 12.5,
  "video_streams": [
    {"index": 0, "codec_name": "h264", "width": 1920, "height": 1080, "fps": 30.0, "pix_fmt": "yuv420p"}
  ],
  "audio_streams": [
    {"index": 0, "codec_name": "aac", "sample_rate": 48000, "channels": 2, "channel_layout": "stereo", "language": "eng"},
    {"index": 1, "codec_name": "aac", "sample_rate": 44100, "channels": 1, "channel_layout": "mono", "language": "spa"}
  ]
}
```

**IMPORTANT**: `index` in `audio_streams`/`video_streams` is TYPE-RELATIVE (0-based
among streams of that type only) — this is exactly the value to pass as `track_index`
to `remove_audio`/`extract_audio_track`. It is NOT a container-wide stream index.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found in project | Verify via `list_files` |
| 400 Bad Request | The file could not be read (corrupt/unsupported) | Inform user, suggest re-uploading |

## Example
User: "This clip has commentary and music mixed as separate tracks — can you drop just the commentary?"
→ Call `get_media_info` → see `audio_streams` has 2 entries, note which index is commentary
→ Call `remove_audio` with that `track_index`
→ Poll `get_job_status` until COMPLETED
→ "Done! I removed the commentary track and kept the music."
