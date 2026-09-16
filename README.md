# VideoWeave MCP — AI Consumer Integration

This repository contains everything an LLM client (Claude Desktop, Claude Code, or any
MCP-compatible agent) needs to control VideoWeave on behalf of a user.

VideoWeave exposes a hosted **Model Context Protocol (MCP) server** that gives AI agents
33 tools covering the full video editing workflow: project management, file upload,
timeline editing, video effects (including trim, fade, reverse, volume adjustment, and
per-track audio inspection/removal/extraction), and job tracking.

---

## Contents

```
README.md                          — this file
CLAUDE.md                          — Claude-specific context loaded at session start
videoweave-upload                  — CLI helper for uploading local files (Python 3)
videoweave-mcp-bridge              — stdio↔HTTP bridge script for manual Desktop setup
videoweave-desktop-extension/
  manifest.json                    — Desktop Extension metadata and user_config schema
  bridge.js                        — zero-dependency Node.js bridge (bundled in .mcpb)
skills/
  atomic/
    00_skill_manifest.md           — master catalog, load this at session start
    01_get_account_info.md
    02_list_projects.md
    03_create_project.md
    04_get_project.md
    05_update_project.md
    06_delete_project.md
    07_list_files.md
    08_upload_file.md
    09_get_file_url.md
    10_delete_file.md
    11_get_track.md
    12_add_clip_to_track.md
    13_remove_clip_from_track.md
    14_cut_video.md
    15_join_videos.md
    16_slow_video.md
    17_speed_up_video.md
    18_add_audio.md
    19_remove_audio.md
    20_add_logo.md
    21_add_text.md
    22_undo.md
    23_finalize_video.md
    24_get_job_status.md
    25_get_active_job.md
    26_get_project_stats.md
    27_trim_clip.md
    28_fade_clip.md
    29_reverse_clip.md
    30_adjust_audio_volume.md
    31_extract_audio_track.md
    32_get_media_info.md
  chains/
    01_create_project_and_upload.md
examples/
  claude_desktop_config.json       — Claude Desktop manual config example
```

---

## Prerequisites

1. A **VideoWeave account** — sign up at https://videoweave.io
2. An **MCP API key** — generate one in your VideoWeave account under
   **Settings → API Keys**
3. An **MCP-compatible LLM client** — Claude Desktop, Claude Code, or any agent that
   speaks the Model Context Protocol
4. **Python 3.8+** — only required for the `videoweave-upload` CLI helper and the
   manual Desktop bridge; not needed if you use the Desktop Extension or Claude Code

---

## Quick Start

### Step 1 — Generate an API Key

1. Log in to VideoWeave
2. Go to **Settings → API Keys** (left sidebar)
3. Click **New Key**, give it a label (e.g. "Claude Desktop")
4. Copy the key — it starts with `vw_` and is shown only once

### Step 2 — Connect your LLM client

#### Claude Code (CLI) — Simplest setup

```bash
claude mcp add --transport http videoweave https://api.videoweave.io/mcp/v1 \
  --header "Authorization: Bearer vw_YOUR_API_KEY_HERE"
```

Verify with `claude mcp list`. If `http` transport is rejected by the server try `sse`
in place of `http`.

#### Claude Desktop — Desktop Extension (Recommended)

Claude Desktop supports installable **Desktop Extensions** (`.mcpb` files). This is
the recommended path for Desktop users — no terminal, no config file editing, no scripts
to install manually. Your API key is entered through Claude Desktop's settings UI and
stored encrypted on your machine.

1. Download `videoweave-desktop-extension.mcpb` from [the videoweave-ai-video-skills repo](https://raw.githubusercontent.com/1155project/videoweave-ai-video-skills/main/videoweave-desktop-extension.mcpb)
2. Open Claude Desktop → click **+** in the chat box → **Connectors**
3. Click **Install Extension…** and select the downloaded `.mcpb` file
4. Enter your `vw_` API key when prompted and click **Save**
5. Restart Claude Desktop — the VideoWeave tools appear in the **+** menu

The extension bundles a zero-dependency Node.js bridge that Claude Desktop runs
locally. It requires nothing beyond Claude Desktop itself.

**Uploads are automatic.** The bridge exposes a built-in `upload_file` tool that streams
your local file straight to VideoWeave's storage — Claude calls it directly with the
`file_id`/`upload_url` from `prepare_upload`. You never see a terminal or run the
`videoweave-upload` CLI helper; that helper is only needed for Claude Code, the manual
Python bridge below, or clients without local tool execution (see
[File Upload](#file-upload)).

> See [Building the Desktop Extension](#building-the-desktop-extension) if you are
> a developer who needs to build or modify the `.mcpb` file.

#### Claude Desktop — Manual fallback (advanced users only)

Use this only if you cannot install the Desktop Extension. Requires Python 3.

```bash
pip install requests
chmod +x videoweave-mcp-bridge
cp videoweave-mcp-bridge /usr/local/bin/videoweave-mcp-bridge
```

Open Claude Desktop → **Settings → Developer → Edit Config** and add:

```json
{
  "mcpServers": {
    "videoweave": {
      "command": "videoweave-mcp-bridge",
      "env": {
        "VIDEOWEAVE_API_KEY": "vw_YOUR_API_KEY_HERE"
      }
    }
  }
}
```

Save the file and restart Claude Desktop.

#### Claude.ai Web

VideoWeave MCP uses API key auth, not OAuth, so pick **No sign-in** and supply the key as
a request header — Claude.ai sends it on every request.

1. Go to **claude.ai → Settings → Connectors** (Team/Enterprise: **Organization settings
   → Connectors**) and click **Add custom connector**
2. Enter the MCP server URL: `https://api.videoweave.io/mcp/v1`
3. Under **Authentication**, choose **No sign-in**
4. Under **Request headers**, add:
   - Name: `Authorization`
   - Value: `Bearer vw_YOUR_API_KEY_HERE` — include the literal word `Bearer` and the
     space; Claude sends the header value exactly as entered, with no scheme added
5. Click **Add**, then enable VideoWeave from the chat's **+ → Connectors** menu

> **Note:** Request header authentication is in beta and only available to some accounts/
> orgs. If your Add-connector dialog has no **Request headers** section, this isn't
> enabled for you yet — use Claude Code or the Desktop Extension (above) in the meantime.

Do **not** use header name `x-auth-token` here — VideoWeave's MCP server only reads the
`Authorization` header, so the header name must be `Authorization`.

#### Any HTTP MCP Client

```
URL:    https://api.videoweave.io/mcp/v1
Method: POST
Headers:
  Authorization: Bearer vw_YOUR_API_KEY_HERE
  Content-Type:  application/json
Protocol: MCP JSON-RPC 2.0 (Streamable HTTP transport)
```

### Step 3 — Install the upload helper

The `videoweave-upload` script is required whenever the agent needs to upload a local file:

```bash
# Install dependencies
pip install requests

# Make the script executable
chmod +x videoweave-upload

# Optional: put it on your PATH
cp videoweave-upload /usr/local/bin/videoweave-upload
```

### Step 4 — Load the skill manifest

In your Claude session, add the skill manifest to your context:

```
Load the VideoWeave skill manifest from skills/atomic/00_skill_manifest.md
and use it to help me edit my videos.
```

---

## Authentication

VideoWeave MCP uses a two-layer authentication system:

### Layer 1 — API Key

Your `vw_` API key authenticates your identity. Pass it as a Bearer token on your
first request (or on every request — both patterns work):

```
Authorization: Bearer vw_<your_api_key>
```

### Layer 2 — Session Token (automatic)

On the first successful request with your API key, the server creates a short-lived
**session JWT** (8-hour TTL) and returns it in the `X-MCP-Session-Token` response header.
MCP-aware clients adopt this token automatically for subsequent requests.

When the session is more than 80% expired, the server silently issues a fresh token in
the `X-MCP-Session-Refresh` header. You do not need to manage session tokens manually —
the MCP client handles this.

**Security note:** Your `vw_` API key is never stored in plain text on VideoWeave servers.
Only a SHA-256 hash is persisted. Treat the raw key like a password.

---

## Tool Reference

All tools are called via `tools/call` in the MCP JSON-RPC protocol. The agent selects
and calls the appropriate tool based on the user's request.

### Account

| Tool | Description |
|------|-------------|
| `get_account_info` | User profile, credit balance, subscription plan |

### Projects

| Tool | Description |
|------|-------------|
| `list_projects` | List all projects (paginated) |
| `create_project` | Create a new project |
| `get_project` | Get project details and storage usage |
| `get_project_stats` | Get credits consumed, storage used, and estimated USD cost for a project |
| `update_project` | Rename or change project settings |
| `delete_project` | Permanently delete a project and all files |

### Files

| Tool | Description |
|------|-------------|
| `list_files` | List all files in a project |
| `prepare_upload` | Register a file and get a presigned upload URL |
| `get_file_url` | Get a 1-hour presigned download URL |
| `delete_file` | Permanently delete a file |
| `confirm_upload` | Confirm a completed upload and generate its thumbnail |
| `get_media_info` | List every video/audio stream in a file — codecs, resolution or channels/sample rate, language tags. **Free — synchronous, no job.** |

### Timeline (Track)

| Tool | Description |
|------|-------------|
| `get_track` | Get the ordered clip list for the timeline |
| `add_clip_to_track` | Append a file to the timeline |
| `remove_clip_from_track` | Remove a clip without deleting the file |

### Edit Operations ⚡ Async

These tools queue a background job and return a `job_id`. Always poll `get_job_status`
until the status is `COMPLETED` or `FAILED` before proceeding.

| Tool | Description | Typical Time |
|------|-------------|--------------|
| `cut_video` | Split a clip at a timestamp | 5–15 s |
| `join_videos` | Merge two or more clips | 10–30 s |
| `slow_video` | Slow down 2×, 3×, or 4× | 15–45 s |
| `speed_up_video` | Speed up 2× or 3× | 10–30 s |
| `add_audio` | Add or replace audio on a clip | 10–30 s |
| `remove_audio` | Strip audio from a clip — all of it, or one specific track via `track_index` (see `get_media_info`) | 5–15 s |
| `trim_clip` | Extract a `[start_time, end_time]` sub-segment as one new clip (unlike `cut_video`, which splits into two) | 5–15 s |
| `fade_clip` | Fade a clip in and/or out — video and audio together | 10–30 s |
| `reverse_clip` | Reverse a clip's playback — video and audio together (rejected if the clip is very long) | 15–60 s |
| `adjust_audio_volume` | Adjust a clip's own audio gain by a multiplier (0.1–2.0) | 10–20 s |
| `extract_audio_track` | Save one audio stream from a clip as a standalone AUDIO file — does **not** modify the source clip | 5–15 s |
| `add_logo` | Overlay a logo/watermark | 10–30 s |
| `add_text` | Add a styled text overlay | 10–30 s |
| `undo` | Restore timeline to a previous snapshot | instant |
| `finalize_video` | Join all clips into a final output | 30–120 s |

### Jobs

| Tool | Description |
|------|-------------|
| `get_job_status` | Check status: QUEUED / PROCESSING / COMPLETED / FAILED |
| `get_active_job` | Check if any job is currently running |

---

## File Upload

Because the MCP server is hosted remotely, it cannot access files on your local machine
directly. Uploads use a two-step approach:

### Step 1 — Prepare the upload (agent calls MCP tool)

The agent calls `prepare_upload` with the filename and file type. The server registers
the file in the database and returns a presigned upload URL:

```json
{
  "tool": "prepare_upload",
  "arguments": {
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
  "upload_url": "https://...",
  "file_key": "tenant/projects/.../clip01.mp4",
  "expires_in": 3600
}
```

### Step 2 — Upload the bytes

**Claude Desktop (Desktop Extension):** the bridge exposes a local `upload_file` tool.
Claude calls it directly — no CLI, no terminal:

```json
{
  "tool": "upload_file",
  "arguments": {
    "file_path": "/path/to/clip01.mp4",
    "upload_url": "https://..."
  }
}
```

The bridge streams the file straight to VideoWeave's object storage and returns a normal
MCP tool result (`isError: false` on success). Once complete, the file is ready — no
further MCP call is needed.

**Every other client (Claude Code, the manual Python bridge, or any client without local
tool execution):** run the `videoweave-upload` CLI helper with the URL from Step 1:

```bash
videoweave-upload --url "<upload_url>" --file "/path/to/clip01.mp4"
```

The helper streams the file directly to VideoWeave's object storage. Upload progress is
shown in the terminal. If the agent supports running shell commands (e.g. Claude Code),
it can run this automatically. Otherwise it provides the command for you to run.

### File Type Reference

| `file_type` | Use for |
|-------------|---------|
| `WORKING` | Standard video clips to edit |
| `AUDIO` | Audio files for `add_audio` |
| `LOGO` | PNG/JPG images for `add_logo` |
| `INDEX` | Intro clip — auto-prepended on `finalize_video` |
| `EXITING` | Outro clip — auto-appended on `finalize_video` |

### File Constraints

- Max file size: 500 MB per file
- Allowed video formats: `.mp4`, `.mov`, `.avi`, `.mkv`, `.webm`
- Allowed audio formats: `.mp3`, `.wav`, `.aac`, `.m4a`, `.webm`
- Allowed image formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

---

## Working with Async Operations

Edit operations are processed in the background. The correct polling pattern is:

```
1. Call edit tool (cut_video / add_text / etc.)
   → Returns: { "job_id": "uuid", "status": "QUEUED" }

2. Wait 3 seconds

3. Call get_job_status with the job_id
   → Returns: { "status": "PROCESSING" | "COMPLETED" | "FAILED" }

4. If PROCESSING → wait 3 seconds and go to step 3
   If COMPLETED → proceed with next operation
   If FAILED → report error_message to user
```

**Only one job can run per project at a time.** The agent should never start a second
edit operation before the first is `COMPLETED`. Use `get_active_job` to check before
starting any edit.

**`get_media_info` is the one exception** — it's a synchronous ffprobe read (no
RabbitMQ job, no polling), same as `get_track`/`list_files`. It returns its result
immediately.

---

## Credit System

Edit operations consume credits from your VideoWeave plan. Approximate costs:

| Operation | Credits |
|-----------|---------|
| cut / join / trim / fade / finalize | 15–20 |
| slow / speed_up / reverse | 20–25 |
| add_audio / remove_audio / adjust_audio_volume | 10–15 |
| extract_audio_track | 15–20 |
| add_logo / add_text | 15–20 |
| get_media_info | Free — synchronous, no credits consumed |

Check your balance before starting a session:

```
Call get_account_info → check credits_remaining
```

If an edit job fails with a payment error, the user must purchase additional credits from
their VideoWeave account before continuing.

---

## Common Workflows

### Start a new project and add clips

```
create_project → prepare_upload (×N) + videoweave-upload (×N) → add_clip_to_track (×N) → get_track
```

See chain skill: `skills/chains/01_create_project_and_upload.md`

### Edit a clip and verify

```
get_track → [edit tool] → get_job_status (poll) → get_track
```

### Add branding and produce final output

```
get_track → add_logo (each clip, poll each) → finalize_video → get_job_status (poll) → get_file_url
```

### Undo a mistake

```
get_track [save snapshot] → [edit runs] → undo (pass saved snapshot) → get_track [verify]
```

### Inspect and remove/extract a specific audio track

```
get_track → get_media_info [note the type-relative audio_streams index] →
  remove_audio (with track_index) OR extract_audio_track (with track_index) →
  get_job_status (poll)
```

Always call `get_media_info` first when targeting a specific track — never guess an
index. A `track_index` beyond the file's actual audio stream count returns `400`
immediately, not a queued job that fails later.

---

## Skills

Skills are structured markdown documents that tell the AI exactly how to call each tool —
what parameters to use, what the response means, how to chain into the next step, and how
to handle errors.

**Load `skills/atomic/00_skill_manifest.md` at the start of every VideoWeave session.**
It is the master index and contains dependency rules, the async polling rule, and common
multi-step patterns.

Individual skill files are in `skills/atomic/`. Chain skills (multi-step workflows) are
in `skills/chains/`.

You can author your own chain skills by composing atomic skills. Use
`skills/chains/01_create_project_and_upload.md` as a template.

---

## MCP Protocol Reference

The VideoWeave MCP server implements the [Model Context Protocol](https://modelcontextprotocol.io)
specification version `2024-11-05`.

### Supported Methods

| Method | Description |
|--------|-------------|
| `initialize` | Handshake — returns server capabilities |
| `ping` | Health check |
| `tools/list` | Returns all 33 tool definitions with JSON Schema |
| `tools/call` | Execute a tool |

### Example Request/Response

```json
// Request
POST https://api.videoweave.io/mcp/v1
Authorization: Bearer vw_xxxxx
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "list_projects",
    "arguments": { "page": 1, "page_size": 10 }
  }
}

// Response
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"items\":[...],\"total\":5,\"page\":1,\"page_size\":10}"
      }
    ],
    "isError": false
  }
}
```

---

## Building the Desktop Extension

The `videoweave-desktop-extension/` directory contains the source for the `.mcpb`
package distributed to end users.

### Structure

```
videoweave-desktop-extension/
  manifest.json   — extension metadata, capability declarations, user_config schema
  bridge.js       — Node.js stdio↔HTTP proxy (zero npm dependencies)
```

### How it works

Claude Desktop runs `bridge.js` as a local subprocess. The bridge reads MCP JSON-RPC
messages from stdin, forwards them to `https://api.videoweave.io/mcp/v1` over HTTPS,
and writes responses back to stdout. Session token management (the `X-MCP-Session-Token`
/ `X-MCP-Session-Refresh` headers) is handled automatically inside the bridge.

The user's API key is injected by Claude Desktop as the `VIDEOWEAVE_API_KEY` environment
variable — the bridge never touches the filesystem and the key never appears in any
config file.

### manifest.json user_config

The manifest declares two user-configurable fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `api_key` | string (sensitive) | Yes | The `vw_` API key — stored encrypted by Claude Desktop |
| `api_url` | string | No | Override the MCP server URL; defaults to `https://api.videoweave.io/mcp/v1` |

Claude Desktop presents these as a settings form when the user installs the extension.
`sensitive: true` on `api_key` ensures it is masked in the UI and encrypted at rest.

### Building the .mcpb file

Install the `mcpb` CLI (published by Anthropic):

```bash
npm install -g @anthropic-ai/mcpb
mcpb --version   # should print 2.x.x
```

Validate the manifest before packing:

```bash
mcpb validate videoweave-desktop-extension/manifest.json
# → Manifest schema validation passes!
```

Pack the extension into a distributable file:

```bash
mcpb pack videoweave-desktop-extension/ videoweave-1.0.0.mcpb
# → produces videoweave-1.0.0.mcpb in the current directory
```

> Without the second argument, `mcpb pack` names the output file after the
> directory (e.g. `videoweave-desktop-extension.mcpb`). Always provide an
> explicit output name for releases.

Name the output `videoweave-desktop-extension.mcpb` (or `-stage.mcpb` for the staging
config) and place it in this `ai_consumer_integration/` folder. The `sync-ai-skills` CI
job mirrors this folder to the public
[videoweave-ai-video-skills](https://github.com/1155project/videoweave-ai-video-skills)
repo on every successful production deploy, so committing it here is what publishes it —
no separate upload step. Once synced, it's downloadable at:
`https://raw.githubusercontent.com/1155project/videoweave-ai-video-skills/main/videoweave-desktop-extension.mcpb`

### Updating the extension

1. Increment `"version"` in `manifest.json`
2. Edit `bridge.js` or `manifest.json` as needed
3. `mcpb validate videoweave-desktop-extension/manifest.json`
4. `mcpb pack videoweave-desktop-extension/ videoweave-<new-version>.mcpb`
5. Publish the new `.mcpb` file

Users who installed via the official Claude Desktop directory receive updates
automatically. Users who installed a private file share must re-download and
re-install.

### Testing locally before packing

You can test the bridge directly without packing:

```bash
VIDEOWEAVE_API_KEY=vw_your_key node videoweave-desktop-extension/bridge.js
```

Then type a raw MCP JSON-RPC message on stdin and press Enter:

```json
{"jsonrpc":"2.0","id":1,"method":"ping","params":{}}
```

Expected response:

```json
{"jsonrpc":"2.0","id":1,"result":{}}
```

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `401 Invalid API key` | Wrong or revoked key | Generate a new key in VideoWeave settings |
| `401 Invalid or expired session token` | Session expired (>8 hours) | Re-authenticate with your API key |
| `404 Project not found` | Wrong `project_id` or wrong account | Call `list_projects` to verify |
| `400 Unknown tool` | Tool name typo | Check `tools/list` for exact names |
| Upload URL expired | URL is >1 hour old | Call `prepare_upload` again |
| Job stuck in `PROCESSING` | Server busy | Wait up to 5 minutes; check `get_active_job` |
| Job `FAILED` | Processing error | Check `error_message` field; retry the operation |
| `PAYMENT_REQUIRED` in job failure | No credits | Purchase credits in VideoWeave billing |
| Extension not appearing after install | Claude Desktop needs restart | Fully quit and relaunch Claude Desktop |
| Extension installed but tools missing | API key not saved | Open Connectors settings, re-enter your `vw_` key |
| Bridge crashes immediately | `VIDEOWEAVE_API_KEY` not set | Re-open extension settings and save the API key |
| `Cannot connect to VideoWeave` | Network or server down | Check https://status.videoweave.io |

---

## Contributing Skills

We welcome community-contributed chain skills. A chain skill should:

1. Use the frontmatter schema (see existing chain skills)
2. Reference only atomic tools from the skill manifest
3. Include a complete worked example
4. Describe natural extension points for further work

Open a pull request in this repository with your new skill file under `skills/chains/`.

---

## License

MIT — see LICENSE file.

## Support

- VideoWeave documentation: https://docs.videoweave.io
- Issues with the MCP server: https://github.com/videoweave/mcp-skills/issues
- Account and billing support: support@videoweave.io
