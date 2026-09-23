---
name: "get_media_frames"
description: Extract a series of frames from a clip over a time range at a fixed interval.
type: atomic
category: inspection
requires: [project_id, file_id, start, end, interval]
outputs: [frames, count]
mcp_tool: get_media_frames
---

# Skill: Get Media Frames

## Purpose
Extract multiple frames across a time range at a fixed interval — targeted
inspection of a specific section of a clip, rather than one frame at a time.
Free — synchronous, no job. Capped at 50 frames per call.

## When to Use
- After a preliminary look (e.g. a contact sheet or scene-change timestamp) suggests
  a specific range of a clip is worth inspecting closely
- Building a step-by-step visual sense of what happens across a section of a clip

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to extract frames from |
| `start` | string | Yes | Start of the range, in seconds |
| `end` | string | Yes | End of the range, in seconds |
| `interval` | string | Yes | Seconds between frames |

`(end - start) / interval` must not exceed 50 — narrow the range or increase the
interval if it would.

## MCP Tool Call
```json
{
  "tool": "get_media_frames",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "start": "18",
    "end": "32",
    "interval": "1"
  }
}
```

## Expected Response
```json
{
  "frames": [
    {"timestamp": 18.0, "frame_url": "https://..."},
    {"timestamp": 19.0, "frame_url": "https://..."}
  ],
  "count": 15
}
```
Each `frame_url` is a presigned URL, valid for 1 hour.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| 400 Bad Request | Requested frame count exceeds 50, or interval is not greater than 0 | Narrow the range, increase the interval, or split into multiple calls |
