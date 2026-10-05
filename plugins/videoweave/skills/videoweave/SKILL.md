---
name: videoweave
description: Edit and produce videos with VideoWeave, a cloud video editing platform controlled through its MCP server. Use when the user wants to create or manage VideoWeave projects, upload or organize clips, build a timeline, cut/trim/join clips, change speed, color-correct, add effects, text, logos or audio, inspect footage, check credits, or render and download a final video.
---

# VideoWeave

VideoWeave's own usage guide is served by its MCP server, so it is always current with the tools you
can call. This skill only tells you where to look.

## Before anything else

1. Confirm the VideoWeave MCP server is connected (its tools appear in your tool list, including
   `get_guide`). If not, tell the user to connect it and point them to the install instructions at
   https://github.com/1155project/videoweave-ai-video-skills, then stop.
2. At the start of every VideoWeave session, call `get_guide` with topic `overview`. It covers the
   rules that apply to every task: edit operations are asynchronous and must be polled, uploads are
   a multi-step flow, and how to check credits.

## Finding what you need

- Call `get_guide` with no arguments for the list of topics.
- Open the task guide that matches the request (for example `guides/assemble`), then the per-tool
  topic (`tools/<tool_name>`) for exact parameters before using a tool you have not called yet.
- Do not guess tool names or parameters from memory; the server's guide and tool list are the source
  of truth.

## Files and downloads

Local file transfer depends on the client (a Desktop extension tool, a command-line helper, or the
web app). `get_guide` explains which applies; follow its upload instructions.
