---
name: "get_project"
description: Get full details for a specific VideoWeave project.
type: atomic
category: project
requires: [project_id]
outputs: [project_id, project_title, project_status, storage_size_mb]
mcp_tool: get_project
---

# Skill: Get Project

## Purpose
Retrieve complete details for a specific project, including title, status, transition
settings, storage size, and timestamps.

## When to Use
- User asks for details about a specific project
- Verifying a project exists before operating on it
- Checking current project status after operations

## Prerequisites
- `project_id` — from `list_projects` or `create_project`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | The project to retrieve |

## MCP Tool Call
```json
{
  "tool": "get_project",
  "params": {
    "project_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "id": "uuid",
  "title": "Product Launch Video",
  "description": "Q3 product launch campaign clips",
  "status": "IN_PROGRESS",
  "transition_type": "FADE",
  "storage_size_mb": 512,
  "created_at": "2026-06-26T10:00:00Z",
  "updated_at": "2026-06-26T14:30:00Z"
}
```

## Output for Chaining
- `id` → confirmed `project_id` for downstream skills
- `status` → use to check if project is `FINALIZED` before starting new edits

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project doesn't exist or belongs to another account | Confirm project_id with user |
| 401 Unauthorized | Session expired | Retry after session refresh |
