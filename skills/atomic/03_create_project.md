---
name: "create_project"
description: Create a new VideoWeave video editing project.
type: atomic
category: project
requires: []
outputs: [project_id, project_title]
mcp_tool: create_project
---

# Skill: Create Project

## Purpose
Create a new video editing project. Returns the new `project_id` which is required for
all subsequent file and edit operations.

## When to Use
- User asks to create a new project
- Beginning a chain that requires a fresh project (e.g., "create a project called X and upload Y")
- User wants to organize a new batch of clips separately from existing projects

## Prerequisites
Active MCP session. No other skills needed.

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `title` | string | Yes | Project name (e.g., "Product Launch Video") |
| `description` | string | No | Optional description |
| `transition_type` | string | No | Default transition between clips: `"NONE"`, `"FADE"`, `"DISSOLVE"` |

## MCP Tool Call
```json
{
  "tool": "create_project",
  "params": {
    "title": "Product Launch Video",
    "description": "Q3 product launch campaign clips",
    "transition_type": "FADE"
  }
}
```

## Expected Response
```json
{
  "id": "uuid",
  "title": "Product Launch Video",
  "description": "Q3 product launch campaign clips",
  "status": "NEW",
  "transition_type": "FADE",
  "created_at": "2026-06-26T10:00:00Z"
}
```

## Output for Chaining
- `id` → `project_id` required by all file upload, track, and edit skills

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 422 Unprocessable Entity | Invalid input (e.g., empty title) | Ask user to provide a valid project title |
| 401 Unauthorized | Session expired | Retry after session refresh |

## Example
User: "Create a new project called 'Summer Campaign 2026'"
→ Call `create_project` with `title: "Summer Campaign 2026"`
→ "Project 'Summer Campaign 2026' created. Project ID: abc-123. Ready to upload files."
