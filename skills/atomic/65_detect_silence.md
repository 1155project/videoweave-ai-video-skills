---
name: "detect_silence"
description: Detect time ranges where a clip's audio track is below a noise threshold.
type: atomic
category: inspection
requires: [project_id, file_id]
outputs: [silences]
mcp_tool: detect_silence
---

# Skill: Detect Silence

## Purpose
Detect time ranges where a clip's audio is below a noise threshold — a
deterministic signal, not a semantic judgment. This tool reports "the audio was
quiet from 2.5s to 4.0s," never "nothing important happened here." Free —
synchronous, no job.

## When to Use
- Finding candidate trim points at the start/end of a clip (dead air before
  someone starts speaking, silence after they finish)
- Distinguishing silent gaps from spoken content before deciding where to call
  get_audio_segment for a closer listen

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to scan |
| `noise_db` | number | No | Noise floor in dB (default -30) — audio below this is considered silence |
| `min_duration` | number | No | Minimum silence duration in seconds to report (default 0.5) |

## MCP Tool Call
```json
{
  "tool": "detect_silence",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "noise_db": -30,
    "min_duration": 0.5
  }
}
```

## Expected Response
```json
{
  "silences": [
    {"start": 0.0, "end": 1.2, "duration": 1.2},
    {"start": 42.1, "end": 45.0, "duration": 2.9}
  ]
}
```
A silence that runs to the very end of the clip is reported with `end` clamped
to the clip's duration. An empty `silences` array is a valid result.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| (long runtime) | Scanning a very long or large clip decodes the entire file once | If it seems to hang, try a lower-resolution/shorter file first, or accept it may take up to ~2 minutes on large clips |
