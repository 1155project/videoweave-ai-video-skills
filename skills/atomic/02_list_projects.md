---
name: "list_projects"
description: List all video editing projects in the user's VideoWeave account.
type: atomic
category: project
requires: []
outputs: [project_id, project_title, project_status, storage_size_mb]
mcp_tool: list_projects
---

# Skill: List Projects

## Purpose
Retrieve a paginated list of all projects in the user's account. Use this to find an
existing project's `project_id` before performing operations on it.

## When to Use
- User asks "what projects do I have?"
- User refers to a project by name — use this to look up its `project_id`
- Beginning a session to orient the user to their existing work

## Prerequisites
Active MCP session. No other skills needed.

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `page` | integer | No | 1 | Page number (1-indexed) |
| `page_size` | integer | No | 20 | Items per page (max 100) |

## MCP Tool Call
```json
{
  "tool": "list_projects",
  "params": {
    "page": 1,
    "page_size": 20
  }
}
```

## Expected Response
```json
{
  "items": [
    {
      "id": "uuid",
      "title": "Product Demo Video",
      "status": "IN_PROGRESS",
      "storage_size_mb": 342,
      "updated_at": "2026-06-25T14:30:00Z"
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 20,
  "total_pages": 1
}
```

## Project Statuses
- `NEW` — project created, no clips added yet
- `IN_PROGRESS` — clips added or editing in progress
- `FINALIZED` — final video has been produced

## Output for Chaining
- `items[].id` → `project_id` required by all project-specific skills
- `items[].title` → use to confirm correct project when user refers to it by name

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 401 Unauthorized | Session expired | Retry after session refresh |
| 500 | Server error | Report to user |

## Example
User: "Show me my projects"
→ Call `list_projects`
→ Present results: "You have 5 projects: Product Demo Video (In Progress, 342MB),
   Training Series Ep1 (Finalized), ..."
