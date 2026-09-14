---
name: "update_project"
description: Rename or update settings for an existing VideoWeave project.
type: atomic
category: project
requires: [project_id]
outputs: [project_id, project_title]
mcp_tool: update_project
---

# Skill: Update Project

## Purpose
Update a project's title, description, or default transition type.

## When to Use
- User asks to rename a project
- User wants to change the default transition type for a project

## Prerequisites
- `project_id` — from `list_projects` or `create_project`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project to update |
| `title` | string | No | New project title |
| `description` | string | No | New description |
| `transition_type` | string | No | `"NONE"`, `"FADE"`, or `"DISSOLVE"` |

At least one of `title`, `description`, or `transition_type` must be provided.

## MCP Tool Call
```json
{
  "tool": "update_project",
  "params": {
    "project_id": "uuid",
    "title": "Summer Campaign 2026 — Final Cut"
  }
}
```

## Expected Response
```json
{
  "id": "uuid",
  "title": "Summer Campaign 2026 — Final Cut",
  "status": "IN_PROGRESS",
  "transition_type": "FADE",
  "updated_at": "2026-06-26T15:00:00Z"
}
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | Project not found | Confirm project_id |
| 422 Unprocessable Entity | Invalid input | Check field values |
