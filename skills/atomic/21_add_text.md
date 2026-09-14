---
name: "add_text"
description: Overlay styled text on a video clip at a specified position.
type: atomic
category: edit
async: true
requires: [project_id, file_id, text]
outputs: [job_id, text_overlay_file_id]
mcp_tool: add_text
---

# Skill: Add Text

## Purpose
Render styled text over a video clip — titles, captions, lower thirds, watermark text.
The original clip is replaced in the timeline by the version with text overlay. This is
an async operation — poll `get_job_status` after calling.

## When to Use
- User wants to add a title, caption, subtitle, or lower-third
- User says "add text", "add title", "add caption", "add a label"

## Prerequisites
- `project_id` — from `list_projects`
- `file_id` — clip to add text to, from `get_track`
- Sufficient credits

## Position
Text position is specified as pixel coordinates (`position_x`, `position_y`) from the
top-left corner of the video frame. Common positions for 1080p video (1920×1080):
- Top center title: `x=960, y=80`
- Lower third: `x=100, y=900`
- Center: `x=960, y=540`
- Bottom center caption: `x=960, y=980`

## Available Fonts
The VideoWeave server has a set of installed system fonts. Common options:
- `"Arial"` — clean, professional
- `"Impact"` — bold, high-contrast
- `"Georgia"` — serif, elegant
- `"Courier New"` — monospace, technical
- `"DejaVu Sans"` — open-source default

If unsure of available fonts, default to `"Arial"`.

## Inputs
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `project_id` | UUID string | Yes | — | Project containing the clip |
| `file_id` | UUID string | Yes | — | Clip to add text to |
| `text` | string | Yes | — | Text to display |
| `font_name` | string | No | `"Arial"` | Font family name |
| `font_size` | integer | No | 48 | Font size in points |
| `font_color` | string | No | `"#FFFFFF"` | Hex color code |
| `bold` | boolean | No | false | Bold text |
| `italic` | boolean | No | false | Italic text |
| `underline` | boolean | No | false | Underlined text |
| `alignment` | string | No | `"center"` | `"left"`, `"center"`, or `"right"` |
| `position_x` | integer | No | 960 | X coordinate (pixels from left) |
| `position_y` | integer | No | 50 | Y coordinate (pixels from top) |

## MCP Tool Call
```json
{
  "tool": "add_text",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid",
    "text": "Summer Campaign 2026",
    "font_name": "Arial",
    "font_size": 72,
    "font_color": "#FFFFFF",
    "bold": true,
    "alignment": "center",
    "position_x": 960,
    "position_y": 80
  }
}
```

## Response (202 Accepted — Async)
```json
{
  "job_id": "uuid",
  "status": "QUEUED",
  "operation": "ADD_TEXT",
  "created_at": "2026-06-26T..."
}
```

## REQUIRED: Poll for Completion
Poll `get_job_status` every 3 seconds until `COMPLETED` or `FAILED`.

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 402 Payment Required | Insufficient credits | Inform user |
| 400 Bad Request | Invalid font or color | Check font name and hex color format |
| 404 Not Found | Clip not in track | Verify via get_track |

## Example
User: "Add a white title 'Product Launch 2026' at the top of clip 1"
→ Call `get_track` → find clip 1's file_id
→ Call `add_text` with `text: "Product Launch 2026"`, white, bold, top-center position
→ Poll until COMPLETED
→ "Done! Title text added to the top of clip 1."
