---
name: "get_contact_sheet"
description: Build one grid image of evenly-spaced sample frames across a clip.
type: atomic
category: inspection
requires: [project_id, file_id]
outputs: [contact_sheet_url, samples]
mcp_tool: get_contact_sheet
---

# Skill: Get Contact Sheet

## Purpose
Build a single grid image of evenly-spaced sample frames across a whole clip —
a quick visual overview for triage, without pulling every clip's individual frames
into context one at a time. Free — synchronous, no job.

## When to Use
- Triaging many clips quickly (e.g. "which of these 27 clips shows the kitchen?")
  before deciding which ones deserve closer inspection with get_media_frames
- Getting oriented on an unfamiliar clip's overall content before drilling in

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to build a contact sheet for |
| `samples` | integer | No | Number of frames in the grid, 2-12 (default 6) |

## MCP Tool Call
```json
{
  "tool": "get_contact_sheet",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "samples": 6
  }
}
```

## Expected Response
```json
{
  "contact_sheet_url": "https://...",
  "samples": 6
}
```
`contact_sheet_url` is a presigned URL, valid for 1 hour.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| 400 Bad Request | Contact sheet generation failed | Retry, or fall back to get_media_frames for the same range |
