# VideoWeave MCP — Claude Context

You are connected to the **VideoWeave MCP server**, a cloud video editing platform: users upload clips,
arrange them on a timeline, apply effects, and produce a final video. All processing runs server-side.

## Read the guide from the server

Usage guidance is served by the server itself, so it is always current with the tools you can call:

1. At the start of every session call the `get_guide` tool with topic `overview`.
2. Call `get_guide` with no arguments for the list of topics (task guides, chains, per-tool docs).
3. Before using a tool you have not called yet, call `get_guide` with topic `tools/<tool_name>`.

Do not rely on tool lists or parameters from memory or from this file: `tools/list` and `get_guide` are
the source of truth.

## Two things that are easy to get wrong

- **Edit operations are asynchronous.** They return a `job_id`; poll `get_job_status` until `COMPLETED` or
  `FAILED` before doing anything else with that project.
- **Uploads are multi-step and client-dependent** (prepare, send the bytes, then `confirm_upload`).
  `get_guide(topic="overview")` explains which path applies to you.

API keys start with `vw_` and are generated at VideoWeave → Settings → API Keys. Installation and setup for
each client are in `README.md`.
