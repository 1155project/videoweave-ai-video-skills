---
name: "adjust_audio_volume"
description: Adjust a clip's own audio gain by a multiplier.
type: atomic
category: edit
async: true
requires: [project_id, file_id]
outputs: [job_id, volume_adjusted_file_id]
mcp_tool: adjust_audio_volume
---

# Skill: Adjust Audio Volume

## Purpose
Adjust a clip's own (native) audio gain by a multiplier — make it louder or quieter.
This is a simple gain multiplier, not full loudness normalization. This is an async
operation — poll `get_job_status` after calling.

**Different from `add_audio`'s `audio_volume`**: that parameter sets the volume of a
*newly added* audio overlay. `adjust_audio_volume` changes the volume of the clip's
*own, existing* audio track.

## When to Use
- User says "make this louder/quieter", "turn down the audio", "boost the volume"
- Balancing volume between clips before joining them

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to adjust, from `get_track`
- Sufficient credits

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip whose audio volume to adjust |
| `volume` | number | No | `1.0` | Multiplier, 0.1–2.0 (0.5 = half volume, 2.0 = double) |

## MCP Tool Call
```json
{
  "tool": "adjust_audio_volume",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "volume": 0.5
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADJUST_AUDIO_VOLUME",
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
User: "Clip 2's audio is way too loud, turn it down to half"
→ Call `get_track` → find clip 2's file_id
→ Call `adjust_audio_volume` with volume=0.5
→ Poll until COMPLETED
→ "Done! Clip 2's audio is now at half volume."
