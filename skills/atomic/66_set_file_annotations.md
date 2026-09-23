---
name: "set_file_annotations"
description: Store your own semantic conclusions about a file. VideoWeave never generates or validates them.
type: atomic
category: annotation
requires: [project_id, file_id, annotations]
outputs: [annotation_id, file_id, created_at]
mcp_tool: set_file_annotations
---

# Skill: Set File Annotations

## Purpose
Store your own semantic conclusions about a file — scene, quality, features,
narrative role, or anything else you've determined from inspecting it. VideoWeave
persists this exactly as given; it never generates, validates, or second-guesses
the content. **Each call adds a new entry — it does not overwrite previous
annotations for the same file.** This lets your semantic catalog of a project
survive across sessions instead of being re-derived every time.

## When to Use
- After inspecting a file (frames, contact sheet, waveform, audio, scene/silence
  detection) and reaching a conclusion worth remembering
- Building a semantic catalog across many files in a project (e.g. tagging each
  clip in a house tour: exterior, kitchen, primary bedroom, etc.)

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — from `list_files`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File the annotation describes |
| `annotations` | object | Yes | Arbitrary semantic payload — shape is entirely up to you |
| `confidence` | number | No | Your confidence in this conclusion, 0.0-1.0 |
| `evidence` | object | No | References supporting the conclusion (e.g. timestamps, frame/segment URLs you inspected) |
| `review_state` | string | No | `UNREVIEWED` (default), `CONFIRMED`, or `REJECTED` |

## MCP Tool Call
```json
{
  "tool": "set_file_annotations",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "annotations": {
      "scene": "kitchen",
      "quality": "good",
      "camera_motion": "slow pan",
      "features": ["island", "stainless appliances", "large windows"]
    },
    "confidence": 0.9,
    "evidence": {"frame_url": "https://..."}
  }
}
```

## Expected Response
```json
{
  "annotation_id": "uuid",
  "file_id": "uuid",
  "created_at": "2026-09-22T15:00:00Z"
}
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found | Confirm file_id via list_files |
| 422 Unprocessable Entity | Invalid `confidence` (must be 0.0-1.0) or `review_state` | Check field values |
