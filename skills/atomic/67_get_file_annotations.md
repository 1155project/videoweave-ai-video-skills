---
name: "get_file_annotations"
description: Retrieve previously stored semantic annotations for a file, newest first.
type: atomic
category: annotation
requires: [project_id, file_id]
outputs: [annotations]
mcp_tool: get_file_annotations
---

# Skill: Get File Annotations

## Purpose
Retrieve all previously stored annotations for a file, newest first. Lets you
recall your own (or a prior session's) semantic conclusions about a file instead
of re-inspecting and re-reasoning about it from scratch every time.

## When to Use
- Before re-inspecting a file, check whether it's already been annotated
- Building or reviewing a project's semantic catalog across many files

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## MCP Tool Call
```json
{
  "tool": "get_file_annotations",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "annotations": [
    {
      "annotation_id": "uuid",
      "annotations": {"scene": "kitchen", "quality": "good"},
      "confidence": 0.9,
      "evidence": {"frame_url": "https://..."},
      "review_state": "UNREVIEWED",
      "created_at": "2026-09-22T15:00:00Z"
    }
  ]
}
```
An empty `annotations` array means the file has no annotations yet — not an error.
If multiple entries exist, the most recent is first; earlier entries are not
necessarily wrong, just superseded by your own later judgment.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
