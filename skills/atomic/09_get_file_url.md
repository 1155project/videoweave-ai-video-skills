---
name: "get_file_url"
description: Get a presigned URL to view or download a file from a VideoWeave project.
type: atomic
category: file
requires: [project_id, file_id]
outputs: [presigned_url, expires_in]
mcp_tool: get_file_url
---

# Skill: Get File URL

## Purpose
Generate a temporary presigned URL for direct access to a file. The URL works without
authentication headers, making it usable in browsers, download managers, and local
CLI scripts. URLs expire after 1 hour.

## When to Use
- User wants to download a file (including the final OUTPUT video)
- Providing a preview URL for a clip
- Getting a download link to share with the user

## Prerequisites
- `project_id` — from `list_projects` or `create_project`
- `file_id` — from `list_files` or `upload_file`

## Inputs
| Parameter | Type | Required | Description |
|---|---|---|---|
| `project_id` | UUID string | Yes | Project containing the file |
| `file_id` | UUID string | Yes | File to generate URL for |

## MCP Tool Call
```json
{
  "tool": "get_file_url",
  "params": {
    "project_id": "uuid",
    "file_id": "uuid"
  }
}
```

## Expected Response
```json
{
  "presigned_url": "https://minio.1155project.com/video-sticher-bucket/...?X-Amz-Signature=...",
  "expires_in": 3600
}
```

## Output for Chaining
- `presigned_url` → provide to user for download, or pass to `videoweave-download` CLI

## Downloading the File Locally
```bash
videoweave-download --url "<presigned_url>" --output "/path/to/save/video.mp4"
# or use curl directly:
curl -o video.mp4 "<presigned_url>"
```

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 404 Not Found | File not found in project | Verify file_id via list_files |

## Example
User: "Download the finalized video for the Summer Campaign project"
→ Call `list_files` to find the OUTPUT file_id
→ Call `get_file_url` with that file_id
→ "Here's your download link (expires in 1 hour): https://... — or run:
   `curl -o summer_campaign_final.mp4 '<url>'`"
