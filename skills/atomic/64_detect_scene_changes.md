---
name: "detect_scene_changes"
description: Detect timestamps where a clip's visual content changes significantly.
type: atomic
category: inspection
requires: [project_id, file_id]
outputs: [scenes]
mcp_tool: detect_scene_changes
---

# Skill: Detect Scene Changes

## Purpose
Detect timestamps where a clip's visual content changes significantly — a
deterministic signal, not a semantic judgment. This tool reports "the image
changed significantly at 12.3 seconds," never "this is the kitchen." Interpreting
*what* changed, and whether it matters, is your job. Free — synchronous, no job.

## When to Use
- Finding candidate cut points or shot boundaries in an unfamiliar clip before
  deciding where to trim or split it
- Deciding where to request closer inspection (get_media_frame / get_media_frames)
  instead of sampling uniformly across a whole clip — uniform sampling can miss
  a brief but important event

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to scan |
| `threshold` | number | No | Sensitivity, 0.0-1.0 (default 0.4) — lower catches more/subtler changes |

## MCP Tool Call
```json
{
  "tool": "detect_scene_changes",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "threshold": 0.4
  }
}
```

## Expected Response
```json
{
  "scenes": [
    {"timestamp": 3.82},
    {"timestamp": 7.14},
    {"timestamp": 11.63}
  ]
}
```
An empty `scenes` array is a valid result — it means no change crossed the
threshold, not an error.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| (long runtime) | Scanning a very long or large clip decodes the entire file once | If it seems to hang, try a lower-resolution/shorter file first, or accept it may take up to ~2 minutes on large clips |
