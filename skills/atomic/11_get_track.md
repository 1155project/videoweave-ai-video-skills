---
name: "get_track"
description: Get the current clip order in a VideoWeave project timeline.
type: atomic
category: track
requires: [project_id]
outputs: [track_items, file_ids_in_order]
mcp_tool: get_track
---

# Skill: Get Track

## Purpose
Retrieve the current state of the project timeline — the ordered list of clips that will
be joined when the project is finalized. Returns each clip with its position, file info,
and thumbnail URL.

## When to Use
- Before edit operations to identify which clip to act on by its position or filename
- After an edit operation to verify the timeline updated correctly
- Before `undo` — save the current state as your snapshot
- User asks "what clips are in my timeline?"

## Prerequisites
- `project_id` — from `list_projects` or `create_project`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project to retrieve track for |

## MCP Tool Call
```json
{
  "tool": "get_track",
  "params": {
    "project_id": "uuid"
  }
}
```

## Expected Response
```json
[
  {
    "id": "track_item_uuid",
    "file_id": "uuid",
    "position": 1,
    "filename": "intro_clip.mp4",
    "video_label": "Intro Clip",
    "mime_type": "video/mp4",
    "thumbnail_url": "https://..."
  },
  {
    "id": "track_item_uuid",
    "file_id": "uuid",
    "position": 2,
    "filename": "main_content.mp4",
    "video_label": "Main Content",
    "mime_type": "video/mp4",
    "thumbnail_url": "https://..."
  }
]
```

## Output for Chaining
- `[].file_id` → pass to edit skills (`cut_video`, `slow_video`, etc.) to specify which clip
- `[].position` → use to describe clip position to the user ("clip 1", "clip 2")
- Entire array → save as snapshot before edit operations to enable `undo`

## Identifying Clips for Operations
When the user refers to a clip by name or position:
1. Call `get_track` to see all clips
2. Match by `filename`, `video_label`, or `position`
3. Use the matching `file_id` for the edit operation

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project not found | Confirm project_id |

## Example
User: "Cut the second clip at 1:30"
→ Call `get_track` → find clip at position 2, note its `file_id`
→ Call `cut_video` with that `file_id` and timestamp `"00:01:30"`
