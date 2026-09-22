---
name: "rename_file"
description: Rename a file within a VideoWeave project by changing its display name.
type: atomic
category: file
requires: [project_id, file_id, filename]
outputs: [file_id, filename]
mcp_tool: rename_file
---

# Skill: Rename File

## Purpose
Change a file's display name (the name shown in the project's file list and used
throughout the UI). Does not affect the underlying stored bytes, only the label.

## When to Use
- User asks to rename a specific file
- Organizing files with clearer names after upload

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to rename |
| `filename` | string | Yes | New display name, 1-128 characters |

## MCP Tool Call
```json
{
  "tool": "rename_file",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "filename": "Intro Clip — Final"
  }
}
```

## Expected Response
```json
{
  "file_id": "uuid",
  "filename": "Intro Clip — Final"
}
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| 400 Bad Request | Empty or >128-character filename | Ask the user for a shorter/non-empty name |
