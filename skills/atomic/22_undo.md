---
name: "undo"
description: Restore the project timeline to a previously saved snapshot state.
type: atomic
category: edit
async: false
requires: [project_id, snapshot_clips]
outputs: [restored_track_items]
mcp_tool: undo
---

# Skill: Undo

## Purpose
Restore the project timeline to a previous state by providing a snapshot of the clips
as they were before an operation. Unlike other edit operations, undo is synchronous —
it's a pure database operation with no video reprocessing.

**Important:** Undo restores the track layout only. It does not re-execute the original
video operation — it re-activates the source files from the snapshot. Credits consumed
by the operation that is being undone are NOT refunded.

## When to Use
- User says "undo", "go back", "revert"
- User made a mistake and wants to restore the previous timeline
- After a failed experiment with an edit operation

## Prerequisites
- `project_id` — from `list_projects`
- A saved snapshot (the `get_track` response from BEFORE the operation that is being undone)

## How to Enable Undo
To allow undo, always call `get_track` before performing an edit operation and save the
result as a snapshot. If the user later wants to undo, pass that snapshot to this skill.

```
1. snapshot = get_track()          ← save this BEFORE the edit
2. cut_video() / add_text() / etc. ← perform the edit
3. If user says "undo":
   undo(snapshot)                   ← restore to saved state
```

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project to restore |
| `clips` | array | Yes | The track snapshot to restore to (array of clip objects from a previous `get_track` call) |

## MCP Tool Call
```json
{
  "tool": "undo",
  "params": {
    "project_id": "uuid",
    "clips": [
      {
        "file_id": "uuid-clip1",
        "position": 1
      },
      {
        "file_id": "uuid-clip2",
        "position": 2
      }
    ]
  }
}
```

The `clips` array is the full track snapshot returned by `get_track` before the edit.

## Expected Response
Returns the restored track — same format as `get_track`:
```json
[
  {
    "id": "track_item_uuid",
    "file_id": "uuid-clip1",
    "position": 1,
    "filename": "clip01.mp4"
  },
  {
    "id": "track_item_uuid",
    "file_id": "uuid-clip2",
    "position": 2,
    "filename": "clip02.mp4"
  }
]
```

## Limitations
- Only one level of undo per saved snapshot
- Multi-level undo requires saving multiple snapshots
- This restores track layout; any processed video files from the undone operation are
  cleaned up by the server's background garbage collector (not immediate)

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | Snapshot clips reference files that no longer exist | Inform user that undo is not possible (too many operations ago) |
| 404 Not Found | Project not found | Verify project_id |

## Example
User: "Undo that last cut"
→ Use saved snapshot from before the cut
→ Call `undo` with the snapshot
→ "Done! The cut has been undone. Your timeline is restored to its previous state."
