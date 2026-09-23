---
name: "get_waveform"
description: Generate a waveform image of a clip's full audio track.
type: atomic
category: inspection
requires: [project_id, file_id]
outputs: [waveform_url]
mcp_tool: get_waveform
---

# Skill: Get Waveform

## Purpose
Generate a single image showing the audio waveform for a clip's entire audio
track — a quick visual read of where audio activity (speech, sound effects,
silence) occurs across the clip. Free — synchronous, no job.

## When to Use
- Getting a quick visual sense of where the loud/quiet parts of a clip's audio are
- Deciding which parts of a clip's audio are worth listening to with get_audio_segment

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to generate a waveform for |

## MCP Tool Call
```json
{
  "tool": "get_waveform",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "waveform_url": "https://..."
}
```
`waveform_url` is a presigned URL, valid for 1 hour.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| 400 Bad Request | File has no audio stream | Call get_media_info first to confirm the file has audio before calling this tool |
