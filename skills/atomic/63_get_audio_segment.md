---
name: "get_audio_segment"
description: Extract a time-bounded audio clip to listen to a specific segment.
type: atomic
category: inspection
requires: [project_id, file_id, start, end]
outputs: [audio_url, start, end]
mcp_tool: get_audio_segment
---

# Skill: Get Audio Segment

## Purpose
Extract a specific time-bounded segment of a clip's audio track so you can listen
to it — visual frames alone can miss meaning that only speech or sound conveys
(e.g. what someone is saying). Free — synchronous, no job. Capped at 300 seconds
per call.

## When to Use
- Visual inspection suggests a segment is important but its meaning depends on
  what's said or heard, not just what's shown
- Confirming or refining a silence-detection or waveform result by actually listening

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to extract audio from |
| `start` | string | Yes | Start of the segment, in seconds |
| `end` | string | Yes | End of the segment, in seconds |

`end - start` must not exceed 300 seconds.

## MCP Tool Call
```json
{
  "tool": "get_audio_segment",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "start": "10",
    "end": "25"
  }
}
```

## Expected Response
```json
{
  "audio_url": "https://...",
  "start": 10.0,
  "end": 25.0
}
```
`audio_url` is a presigned URL, valid for 1 hour.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| 400 Bad Request | Segment exceeds 300 seconds, or file has no audio stream | Split into multiple calls, or confirm via get_media_info that the file has audio |
