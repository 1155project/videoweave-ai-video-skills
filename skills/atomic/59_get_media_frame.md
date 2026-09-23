---
name: "get_media_frame"
description: Extract a single frame from a clip at a timestamp as a viewable image.
type: atomic
category: inspection
requires: [project_id, file_id, timestamp]
outputs: [frame_url, timestamp]
mcp_tool: get_media_frame
---

# Skill: Get Media Frame

## Purpose
Extract one frame from a clip at a specific timestamp so you can see what the clip
looks like at that moment. Free — synchronous, no job. This tool reports what a
frame looks like; it does not tell you what it means — that interpretation is yours.

## When to Use
- Quickly checking what a clip shows at a specific moment before deciding how to edit it
- Confirming the result of a scene-change or silence-detection timestamp visually

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to extract a frame from |
| `timestamp` | string | Yes | Seconds into the clip, e.g. `"4.5"` |

## MCP Tool Call
```json
{
  "tool": "get_media_frame",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "timestamp": "4.5"
  }
}
```

## Expected Response
```json
{
  "frame_url": "https://...",
  "timestamp": 4.5
}
```
`frame_url` is a presigned URL, valid for 1 hour.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| 400 Bad Request | Frame extraction failed (e.g. timestamp beyond clip duration) | Check the clip's duration via get_media_info and retry with a valid timestamp |
