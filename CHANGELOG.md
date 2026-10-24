# Changelog

Versions follow `VERSION` in this folder. One number drives the Claude Code plugin, the marketplace
entry, the Desktop extension manifest, and the release tag.

## 1.8.1

- **Added** `credits_charged` in every edit tool's immediate response, `duration_seconds` on `get_track` items, and
  `output_duration_seconds` / `output_width` / `output_height` on completed jobs in `get_job_status`.
- **Added** `factor` and `clip_count` parameters to `estimate_credits`, so slow-motion, speed-up and join estimates
  equal the real charge.

## 1.8.0

- **Added** `list_file_versions` and `restore_file_version` MCP tools: every edit keeps the file it replaced, so a
  clip's earlier versions can be listed and any of them restored instantly (no credits, timeline updated).
- **Changed** `delete_file` / `bulk_delete_files` now remove a file together with all its earlier versions; the id of
  an earlier version is refused. Edit responses can carry a `storage_warning` and edits are refused (507) when the
  plan's storage limit is exceeded by more than 10%.
- **Changed** the Desktop extension description now says 75 tools.

## 1.7.1

- **Fixed** `videoweave-upload` sent both `Content-Length` and chunked transfer encoding, which strict storage
  endpoints reject with HTTP 400. It now sends `Content-Length` only.
- **Changed** the Desktop extension description now says 73 tools (the server added `cancel_job`).

## 1.7.0

New delivery model. Usage guidance now lives in the VideoWeave MCP server itself and is read through
the new `get_guide` tool, so it can no longer drift from the tools it describes.

- **Added** `get_guide` MCP tool (topic index, task guides, per-tool docs) and `instructions` in the
  server's `initialize` response.
- **Added** one small `videoweave` skill whose only job is to point the model at `get_guide`.
- **Added** Claude Code plugin + marketplace (`/plugin marketplace add`), which also connects the MCP
  server and prompts for the API key.
- **Changed** the Desktop extension (`.mcpb`) is now built in CI from `VERSION`, not packed by hand.
- **Removed** the ~70 per-tool skill files, the task guides, and the manifest from this folder (now
  served by the server). Clean cut: the public repo layout changes.
