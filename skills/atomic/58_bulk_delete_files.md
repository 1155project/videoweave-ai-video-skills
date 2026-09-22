---
name: "bulk_delete_files"
description: Permanently delete multiple files from a VideoWeave project in one call.
type: atomic
category: file
requires: [project_id, file_ids]
outputs: [deleted, failed, total, deleted_count, failed_count]
mcp_tool: bulk_delete_files
---

# Skill: Bulk Delete Files

## Purpose
Delete up to 100 files from a project in a single call. Removes each file from
both storage and the database, and from the timeline if any are currently in the
track. More efficient than calling `delete_file` in a loop for cleanup tasks.

## When to Use
- User asks to clean up a project by removing several files at once
- Removing all files of a given type or all files no longer needed after a project is finalized

## Prerequisites
- `project_id` — from `list_projects`
- `file_ids` — from `list_files`

## IMPORTANT: Confirm Before Calling
This is higher-risk than `delete_file` — it can remove up to 100 files
irreversibly in one call. Before calling:
1. Call `list_files` (if you haven't already) and resolve the exact filenames for
   every `file_id` you intend to delete.
2. Show the user the specific list of filenames (not just a count) and the total
   count, and state that this cannot be undone.
3. Only call `bulk_delete_files` after the user confirms that exact list — if the
   user's intent changes (adds/removes a file from the list), re-confirm before
   calling.

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the files |
| `file_ids` | array of UUID strings | Yes | 1-100 files to delete |

## MCP Tool Call
```json
{
  "tool": "bulk_delete_files",
  "params": {
    "project_id": "uuid",
    "file_ids": ["uuid1", "uuid2", "uuid3"]
  }
}
```

## Expected Response
```json
{
  "deleted": ["uuid1", "uuid2"],
  "failed": [{"file_id": "uuid3", "error": "File not found in project"}],
  "total": 3,
  "deleted_count": 2,
  "failed_count": 1
}
```
Always check `failed_count` — a non-zero value means some files were NOT deleted;
report the specific `failed` entries to the user rather than assuming full success.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | No file_ids provided, or more than 100 | Split into batches of ≤100 |
| 404 Not Found | Project not found | Confirm project_id via list_projects |
| (per-item) `failed` entry | That specific file could not be deleted | Report the file_id + error to the user; other files in the same call may have still succeeded |
