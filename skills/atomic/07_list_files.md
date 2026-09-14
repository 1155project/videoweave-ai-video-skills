---
name: "list_files"
description: List all files uploaded to a VideoWeave project.
type: atomic
category: file
requires: [project_id]
outputs: [file_id, filename, file_type, mime_type, thumbnail_url]
mcp_tool: list_files
---

# Skill: List Files

## Purpose
Retrieve all files in a project. Use this to find a `file_id` before adding a clip to
the track, performing an edit operation, or getting a download URL.

## When to Use
- Finding the `file_id` for a clip by its filename
- Checking what files have been uploaded to a project
- Locating an audio file or logo file before using it in an edit

## Prerequisites
- `project_id` — from `list_projects` or `create_project`

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | The project to list files for |
| `page` | integer | No | 1 | Page number |
| `page_size` | integer | No | 20 | Items per page (max 100) |

## MCP Tool Call
```json
{
  "tool": "list_files",
  "params": {
    "project_id": "uuid",
    "page": 1,
    "page_size": 50
  }
}
```

## Expected Response
```json
{
  "items": [
    {
      "file_id": "uuid",
      "filename": "clip01.mp4",
      "file_type": "WORKING",
      "mime_type": "video/mp4",
      "file_size_mb": 142.5,
      "thumbnail_url": "https://...",
      "uploaded_at": "2026-06-26T10:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "page_size": 20
}
```

## File Types
- `WORKING` — standard video clip (uploaded by user)
- `OUTPUT` — finalized video produced by `finalize_video`
- `AUDIO` — audio file for use with `add_audio`
- `LOGO` — image file for use with `add_logo`
- `INDEX` — intro clip (prepended automatically on finalize if set)
- `EXITING` — outro clip (appended automatically on finalize if set)

## Output for Chaining
- `items[].file_id` → required by track management and edit skills
- `items[].file_type` → use to filter for the right file type (e.g., AUDIO for add_audio)

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project not found | Confirm project_id |
