---
name: "upload_file"
description: Upload a local video, audio, or image file to a VideoWeave project.
type: atomic
category: file
requires: [project_id]
outputs: [file_id, filename, file_type]
mcp_tool: prepare_upload
---

# Skill: Upload File

## Purpose
Upload a local file to a VideoWeave project. Because the MCP server is hosted remotely
and cannot access your local filesystem directly, this skill uses a two-step approach:
the MCP tool generates a presigned upload URL, and a local CLI helper performs the
actual file transfer.

## When to Use
- User wants to add a video clip to a project
- User wants to upload an audio file for voiceover
- User wants to upload a logo image for watermarking

## Prerequisites
- `project_id` — from `list_projects` or `create_project`
- The `videoweave-upload` CLI helper must be installed locally
- The local file must exist at the specified path

## File Type Reference
| file_type | Use For |
|---|---|
| `WORKING` | Standard video clips to be edited |
| `AUDIO` | Audio files used with `add_audio` |
| `LOGO` | Image files (PNG/JPG) used with `add_logo` |
| `INDEX` | Intro clip (auto-prepended on finalize) |
| `EXITING` | Outro clip (auto-appended on finalize) |

## Constraints (from VideoWeave validation)
- Max file size: 500MB per file
- Max video duration: varies by plan (typically 2 hours)
- Allowed video extensions: .mp4, .mov, .avi, .mkv, .webm
- Allowed audio extensions: .mp3, .wav, .aac, .m4a, .webm
- Allowed image extensions: .jpg, .jpeg, .png, .gif, .webp

## Step 0 — Decide How You'll Get the Bytes In

First, decide how you'll get the file's bytes into VideoWeave.

- **If you have local execution** (a bash/shell tool, or you are the VideoWeave Desktop
  Extension): continue to Step 1 below — you'll call `prepare_upload` yourself.
- **If you have neither** (e.g. you are a browser-based chat client such as Claude.ai
  Web, with no shell tool and no native upload tool): **do not call `prepare_upload` at
  all.** Instead, tell the user to open `https://www.videoweave.io/projects/{project_id}`
  (using the `project_id` you already have from `list_projects`/`create_project`), log in
  if needed, and use the Upload button on that page's Files tab to add the file
  themselves — that page already exists and already works. Once they confirm the upload
  is done, call `list_files` to find the new file and its `file_id`. Do not call
  `confirm_upload` for a file uploaded this way — there is no reserved MCP file_id to
  confirm against; the web upload is already fully complete and registered the moment it
  finishes. **Known gap:** this path only covers `WORKING`/`AUDIO`/`LOGO` files — the web
  UI has no way to upload `INDEX`/`EXITING`/`BACKGROUND` files today, so tell the user
  that specific limitation if that's what they need.

## Step 1 — Prepare Upload (MCP Tool Call)

Only for clients with local execution (see Step 0).

```json
{
  "tool": "prepare_upload",
  "params": {
    "project_id": "uuid",
    "filename": "clip01.mp4",
    "file_type": "WORKING"
  }
}
```

Response:
```json
{
  "file_id": "uuid",
  "upload_url": "https://storage.videoweave.io/uploads/...?signature=...",
  "expires_in": 3600
}
```

## Step 2 — Execute Local Upload

Two paths, depending on which kind of local execution you have:

**If connected via the VideoWeave Desktop Extension:** call the bridge's local
`upload_file` MCP tool directly — do not run a CLI command:

```json
{
  "tool": "upload_file",
  "arguments": {
    "file_path": "/path/to/clip01.mp4",
    "upload_url": "<upload_url>"
  }
}
```

The bridge streams the file locally and returns a normal MCP tool result
(`isError: false` on success). No terminal is shown to the user.

**Do not attach or drag the video/audio file into the chat.** `file_path` must be a
real path on the user's own computer — the bridge runs locally and reads the file
directly from disk. If the user has attached the file to the conversation instead of
telling you its path, its bytes went to your own remote environment, not to any
location on their computer; the bridge will report "File not found" when you try to
use that attachment as `file_path`. Ask the user for the file's actual local path
instead (e.g. "What's the path to clip01.mp4 on your computer?").

**Every other client with local execution** (Claude Code, the manual Python bridge):
run the VideoWeave CLI helper with the presigned URL:

```bash
videoweave-upload --url "<upload_url>" --file "/path/to/clip01.mp4"
```

The CLI script streams the file to storage and confirms completion. The `file_id` is
already registered in the database — no further call is needed.

**Note:** This branch assumes the agent environment can run local scripts (e.g., via a
bash tool in Claude Code) and call this directly. If you find yourself here with no way
to actually run the command, you picked the wrong branch at Step 0 — go back and use the
no-local-execution path instead.

## Expected Outcome
After the upload completes, the file is available in the project. Verify with `list_files`.

## Output for Chaining
- `file_id` → required by `add_clip_to_track`, `add_audio`, `add_logo`

## Error Handling
| Error | Meaning | Action |
|---|---|---|
| 400 Bad Request | Invalid file type or extension | Check file_type matches the file's format |
| 413 Payload Too Large | File exceeds size limit | Compress or split the video |
| 422 Unprocessable Entity | Invalid parameters | Check project_id and filename |
| Upload URL expired | URL expired before upload | Call prepare_upload again |
| `upload_file` reports "File not found" (Desktop Extension) | The file was attached to the chat instead of referenced by its local path | Ask the user for the file's actual path on their computer — do not use a chat attachment as `file_path` |
| No local execution, and file_type is `INDEX`/`EXITING`/`BACKGROUND` | The web UI upload path (Step 0's no-local-execution branch) only supports `WORKING`/`AUDIO`/`LOGO` | Tell the user there is currently no upload path for this file type from a client with no local execution |

## Example
User: "Upload clip01.mp4 from my clips folder to the Summer Campaign project"
→ Call `upload_file` → get `file_id` + `upload_url`
→ Run: `videoweave-upload --url "..." --file "~/clips/clip01.mp4"`
→ "clip01.mp4 uploaded successfully. File ID: xyz-456. Ready to add to the timeline."
