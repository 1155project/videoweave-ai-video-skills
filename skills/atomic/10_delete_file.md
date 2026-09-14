---
name: "delete_file"
description: Permanently delete a file from a VideoWeave project.
type: atomic
category: file
requires: [project_id, file_id]
outputs: []
mcp_tool: delete_file
---

# Skill: Delete File

## Purpose
Permanently delete a file from a project. Removes the file from both storage and the
database. Also removes the file from the timeline if it is currently in the track.

## When to Use
- User asks to remove a specific file from a project
- Cleaning up uploaded files that are no longer needed

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## IMPORTANT: Confirm Before Calling
Confirm with the user before deleting. State the filename and that it cannot be undone.

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to delete |

## MCP Tool Call
```json
{
  "tool": "delete_file",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "message": "File uuid deleted successfully"
}
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
