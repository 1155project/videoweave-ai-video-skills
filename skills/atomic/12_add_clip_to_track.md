---
name: "add_clip_to_track"
description: Add an uploaded video file to the VideoWeave project timeline.
type: atomic
category: track
requires: [project_id, file_id]
outputs: [track_item_id, position]
mcp_tool: add_clip_to_track
---

# Skill: Add Clip to Track

## Purpose
Add an uploaded video clip to the project timeline. The clip is appended at the end of
the current track. Files must be uploaded before they can be added to the track.

## When to Use
- After uploading a file with `upload_file`, add it to the timeline
- Building a track from multiple uploaded clips

## Prerequisites
- `project_id` — from `list_projects` or `create_project`
- `file_id` — from `upload_file` or `list_files`; file must be type `WORKING` or similar video type

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project to add clip to |
| `file_id` | UUID string | Yes | Uploaded video file to add |

## MCP Tool Call
```json
{
  "tool": "add_clip_to_track",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "id": "track_item_uuid",
  "file_id": "uuid",
  "position": 3,
  "filename": "clip03.mp4",
  "mime_type": "video/mp4"
}
```

## Output for Chaining
- `file_id` → confirmed for use in edit operations
- `position` → tells you where in the timeline the clip was placed

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project or file not found | Verify IDs |
| 400 Bad Request | File is not a video type | Check file type; AUDIO and LOGO files cannot be added to track |

## Note on Clip Order
Clips are always appended at the end. To reorder clips, use the `move_clip_in_track`
tool (not currently a standalone skill — submit a feature request if needed, or call
the API endpoint `PUT /api/v1/projects/{project_id}/track/clips/move` directly).
