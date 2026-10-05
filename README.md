# VideoWeave MCP — AI Consumer Integration

This repository contains everything an LLM client (Claude Desktop, Claude Code, or any
MCP-compatible agent) needs to control VideoWeave on behalf of a user.

VideoWeave exposes a hosted **Model Context Protocol (MCP) server** that gives AI agents
tools covering the full video editing workflow: project management, file upload, timeline
editing, a full video-effects suite, deterministic media inspection, credit-cost estimation,
and job tracking.

**The server documents itself.** Usage guidance (rules, task guides, and per-tool parameters) is
served by the MCP server through the `get_guide` tool, so it is always current with the tools it
describes. The only thing you install besides the connection is one small skill that tells the
LLM to read it.

---

## Contents

```
README.md                          — this file
CHANGELOG.md, VERSION              — release notes; one version number for every artifact below
CLAUDE.md                          — short context for Claude working in this folder
.claude-plugin/marketplace.json    — Claude Code marketplace (add this repo to install the plugin)
plugins/videoweave/                — Claude Code plugin: MCP connection + the VideoWeave skill
videoweave-skill.zip               — the VideoWeave skill, for claude.ai / Claude Desktop upload
videoweave-desktop-extension.mcpb  — Claude Desktop Extension (built from the folder below)
videoweave-desktop-extension/      — extension source: manifest.json, bridge.js (auditable)
videoweave-upload                  — CLI helper for uploading local files (Python 3)
videoweave-mcp-bridge              — stdio↔HTTP bridge script for manual Desktop setup
examples/claude_desktop_config.json — Claude Desktop manual config example
```

In the source repository (`1155project/video_sticher`) this folder also holds `skill/`, `plugin/`,
`marketplace.json` and `scripts/build_distribution.py`, which generate everything above. The
usage guides themselves live in the backend at `backend/src/mcp_guides/`.

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

#### Claude Code (CLI) — Plugin (Recommended)

One install gives you the MCP connection **and** the VideoWeave skill:

```bash
claude plugin marketplace add 1155project/videoweave-ai-video-skills
claude plugin install videoweave@videoweave
```

Claude Code asks for your API key when the plugin is enabled and stores it securely. You can also
run `/plugin` inside a session to browse and install.

#### Claude Code (CLI) — Manual connection only

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
`videoweave-upload` CLI helper; that helper is only needed for Claude Code or the manual
Python bridge below. Clients with no local execution at all (e.g. Claude.ai Web) skip
`prepare_upload` entirely and use the web UI instead (see [File Upload](#file-upload)).

> **Do not attach or drag your video/audio file into the chat.** Tell Claude the
> file's path on your computer instead (e.g. "upload the file at
> `/Users/you/Videos/clip01.mp4`"). Attaching a file to the conversation sends its
> bytes to Claude's own remote environment, not to a location on your disk — the
> bridge runs locally and reads the file directly from your filesystem, so it needs
> a real local path, not a file you've shared in the chat. If you attach the file
> first, `upload_file` will report "File not found" because it's looking on your
> computer for a path that only exists in the conversation.

**Downloads are automatic too.** The bridge exposes a built-in `download_file` tool
that streams a finished video (or any project file) straight to your computer — Claude
calls it directly with the `download_url` from `get_file_url` and a local `output_path`
you give it. No `curl`, no terminal.

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

> **Note:** If you already have a VideoWeave connector configured, don't add a second
> one — Claude.ai will register it under an auto-generated suffixed name (e.g.
> `VideoWeave-c0bc68d9`) rather than replacing the original, and both will appear as
> live, functionally-identical connectors.

> **Note:** Request header authentication is in beta and only available to some accounts/
> orgs. If your Add-connector dialog has no **Request headers** section, this isn't
> enabled for you yet — use Claude Code or the Desktop Extension (above) in the meantime.

Do **not** use header name `x-auth-token` here — VideoWeave's MCP server only reads the
`Authorization` header, so the header name must be `Authorization`.

**File Upload:** Claude.ai Web has no local execution, so it cannot run the
`videoweave-upload` CLI or use the Desktop bridge's `upload_file` tool. For uploads, the
agent should direct you to `https://www.videoweave.io/projects/{project_id}` to upload
through the existing web UI's Files tab instead of calling `prepare_upload` — see
[File Upload](#file-upload).

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

### Step 4 — Install the VideoWeave skill

The skill is a small file that tells your LLM to call `get_guide` first. It is optional (the server also
sends the same hint in its `initialize` response and in tool descriptions), but it makes the model reliably
read the guide before it starts.

| Client | How |
|---|---|
| Claude Code | Already included if you installed the plugin above |
| Claude Desktop / claude.ai | Download `videoweave-skill.zip` from the [latest release](https://github.com/1155project/videoweave-ai-video-skills/releases/latest) and upload it under **Settings → Features** (code execution must be enabled; custom skills are per-user, not organization-wide) |
| Other MCP clients | Skip it. Tell your LLM: "Call the `get_guide` tool with topic `overview` before using VideoWeave" |

You do not need to load any other files. Everything else is read from the server on demand.

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
**session token** (8-hour TTL) and returns it in the `X-MCP-Session-Token` response header.
MCP-aware clients adopt this token automatically for subsequent requests.

When the session is more than 80% expired, the server silently issues a fresh token in
the `X-MCP-Session-Refresh` header. You do not need to manage session tokens manually —
the MCP client handles this.

**Security note:** Your `vw_` API key is never stored in plain text on VideoWeave servers.
Only a SHA-256 hash is persisted. Treat the raw key like a password.

---

## Tool Reference

Tools, parameters, and workflows are documented by the server itself, not in this file, so they never
go out of date. Ask your LLM to call `get_guide` (no arguments lists every topic), or call it yourself:

```
get_guide                                 → index of all topics
get_guide(topic="overview")               → rules every session needs; start here
get_guide(topic="guides/assemble")        → task guides (upload_and_setup, assemble, look_and_color, audio, export)
get_guide(topic="tools/cut_video")        → exact parameters for one tool
```

`tools/list` returns the authoritative tool names and JSON Schemas.

---

## File Upload

Because the MCP server is hosted remotely, it cannot access files on your local machine
directly. Uploads use a two-step approach — **except for clients with no local execution
at all (see Step 0)**, which skip both steps and use VideoWeave's existing web UI instead.

### Step 0 — No local execution? Skip straight to the web UI

If the agent has no shell/bash tool and no native upload tool (e.g. Claude.ai Web or
another browser-based chat client), it should **not** call `prepare_upload`. Instead it
directs you to open `https://www.videoweave.io/projects/{project_id}` and upload the file
yourself through that page's Files tab — the same upload feature the regular VideoWeave
web app has always had. Once you confirm the upload, the agent calls `list_files` to find
the new file; no `confirm_upload` call is needed for a file uploaded this way. This path
only supports `WORKING`/`AUDIO`/`LOGO` files — there is currently no way to upload
`INDEX`/`EXITING`/`BACKGROUND` files from a client with no local execution.

If the agent does have local execution, continue with Step 1 and Step 2 below.

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

**Every other client with local execution (Claude Code, the manual Python bridge):** run
the `videoweave-upload` CLI helper with the URL from Step 1:

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

## Using VideoWeave

The essentials every client should know (the full rules are in `get_guide(topic="overview")`):

- **Edit operations are asynchronous.** They return a `job_id` with status `QUEUED`; poll
  `get_job_status` every few seconds until `COMPLETED` or `FAILED`. One job runs per project at a time.
- **Edits cost credits.** Use `estimate_credits` to price an operation before running it,
  `get_account_info` for your balance, and `get_project_stats` for what a project has used. Failed
  jobs are refunded.
- **Workflows** (start a project, edit a clip, add branding, undo, work with audio tracks) are in the
  task guides under `get_guide`.

---

## MCP Protocol Reference

The VideoWeave MCP server implements the [Model Context Protocol](https://modelcontextprotocol.io)
specification version `2024-11-05`.

### Supported Methods

| Method | Description |
|--------|-------------|
| `initialize` | Handshake — returns server capabilities and a short `instructions` string pointing at `get_guide` |
| `ping` | Health check |
| `tools/list` | Returns all tool definitions with JSON Schema |
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

### Building and publishing

Everything published to the public repo is produced by one script from one version number:

```bash
python3 ai_consumer_integration/scripts/build_distribution.py --check        # validate only
python3 ai_consumer_integration/scripts/build_distribution.py --out /tmp/vw  # build (no .mcpb)
python3 ai_consumer_integration/scripts/build_distribution.py --out /tmp/vw --pack-mcpb
```

`--pack-mcpb` needs the `mcpb` CLI (`npm install -g @anthropic-ai/mcpb`). The build **fails** (and so
does the `backend` unit test that runs it) when: `VERSION` is not semver, `videoweave-desktop-extension/manifest.json`
`version` differs from `VERSION`, the tool count in the manifest's `long_description` differs from the server's
real tool count plus the two bridge-local tools, or the VideoWeave skill names any tool other than `get_guide`.

The `.mcpb` is **never committed**; CI builds it. The `sync-ai-skills` job in `.github/workflows/docker-build.yml`
runs after a successful production deploy, builds the distribution, replaces the contents of the public
[videoweave-ai-video-skills](https://github.com/1155project/videoweave-ai-video-skills) repo with the built
output, and tags `v<VERSION>` (attaching the skill zip and `.mcpb` to a release). Only the production server URL is
ever shipped.

To validate the generated plugin locally, run `claude plugin validate <out>` and
`claude plugin validate <out>/plugins/videoweave`.

### Updating the extension

1. Edit `bridge.js` or `manifest.json` as needed.
2. Bump `ai_consumer_integration/VERSION` **and** `manifest.json` `"version"` together, and add a
   `## <version>` heading to `CHANGELOG.md`.
3. If you added or removed a bridge-local tool, update `BRIDGE_LOCAL_TOOLS` in
   `backend/tests/unit/test_mcp_guides_drift.py` and `BRIDGE_LOCAL_TOOL_COUNT` in the build script, and add or
   remove its `tools/<name>.md` guide.
4. Run `--check`, then merge. CI publishes on the next production deploy.

Users who installed via the official Claude Desktop directory receive updates automatically. Users who
installed a downloaded `.mcpb` must re-download and re-install.

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
| `upload_file` reports "File not found" (Desktop Extension) | The file was attached/dragged into the chat instead of referenced by its local path — Claude's remote environment received the bytes, but the bridge (running on your computer) has no way to reach them | Don't attach the file to the conversation. Tell Claude the file's actual path on your computer instead |

---

## Contributing

This repository is generated; do not edit it directly. The usage guides (`overview`, task guides, chains,
per-tool docs) live in the main repository under `backend/src/mcp_guides/`, and a unit test fails if a tool
and its guide ever disagree. Open issues here; changes go through the main repository.

---

## License

MIT — see LICENSE file.

## Support

- VideoWeave documentation: https://docs.videoweave.io
- Issues with the MCP server: https://github.com/videoweave/mcp-skills/issues
- Account and billing support: support@videoweave.io
