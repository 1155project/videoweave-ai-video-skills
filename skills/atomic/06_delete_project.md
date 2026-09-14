---
name: "delete_project"
description: Permanently delete a VideoWeave project and all its files. Irreversible.
type: atomic
category: project
requires: [project_id]
outputs: []
mcp_tool: delete_project
---

# Skill: Delete Project

## Purpose
Permanently delete a project and all associated files from both the database and storage.
This action is irreversible — confirm with the user before calling.

## When to Use
- User explicitly asks to delete a project
- Cleaning up test or draft projects

## Prerequisites
- `project_id` — from `list_projects`

## IMPORTANT: Confirm Before Calling
Always confirm with the user before calling this skill. State:
- The exact project title
- That all files will be permanently deleted
- That this cannot be undone

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project to delete |

## MCP Tool Call
```json
{
  "tool": "delete_project",
  "params": {
    "project_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "message": "Project uuid deleted successfully"
}
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project not found | Confirm project_id with user |
| 401 Unauthorized | Session expired | Retry after session refresh |
