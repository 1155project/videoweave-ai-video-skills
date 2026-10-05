# Changelog

Versions follow `VERSION` in this folder. One number drives the Claude Code plugin, the marketplace
entry, the Desktop extension manifest, and the release tag.

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
