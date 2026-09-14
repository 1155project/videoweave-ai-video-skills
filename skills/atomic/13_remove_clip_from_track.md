---
name: "remove_clip_from_track"
description: Remove a clip from the VideoWeave project timeline without deleting the file.
type: atomic
category: track
requires: [project_id, file_id]
outputs: []
mcp_tool: remove_clip_from_track
---

# Skill: Remove Clip from Track

## Purpose
Remove a clip from the project timeline. The file is NOT deleted from the project —
it remains available in `list_files` and can be re-added later. Only the timeline
entry is removed.

## When to Use
- User wants to remove a clip from the edit sequence without deleting the source file
- Reorganizing a timeline by removing and re-adding clips

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `get_track` (use the clip's `file_id` from the track, not from list_files)

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the track |
| `file_id` | UUID string | Yes | File ID of the clip to remove from track |

## MCP Tool Call
```json
{
  "tool": "remove_clip_from_track",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "message": "Clip uuid removed from track"
}
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Clip not in track | Verify file_id via get_track |
