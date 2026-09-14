#!/usr/bin/env node
"use strict";
/**
 * videoweave-mcp-bridge (Node.js)
 *
 * stdio↔HTTP bridge for Claude Desktop Extensions (.mcpb).
 * Reads MCP JSON-RPC messages from stdin, forwards them to the VideoWeave
 * MCP server over HTTPS, writes responses to stdout.
 *
 * Zero npm dependencies — uses only Node.js built-ins.
 *
 * Environment variables (injected by Claude Desktop from user_config):
 *   VIDEOWEAVE_API_KEY  — required, starts with vw_
 *   VIDEOWEAVE_MCP_URL  — optional, defaults to production URL
 */

const https = require("https");
const http = require("http");
const readline = require("readline");

const DEFAULT_URL = "https://stageapi.videoweave.io/mcp/v1";
const serverUrl = process.env.VIDEOWEAVE_MCP_URL || DEFAULT_URL;
const apiKey = process.env.VIDEOWEAVE_API_KEY || "";

if (!apiKey) {
  process.stderr.write(
    "Error: VIDEOWEAVE_API_KEY is not set.\n" +
    "Set it in Claude Desktop → Connectors → VideoWeave → Settings.\n"
  );
  process.exit(1);
}

let sessionToken = null;

function post(payload, callback) {
  const body = JSON.stringify(payload);
  const url = new URL(serverUrl);
  const lib = url.protocol === "https:" ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname + (url.search || ""),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(body),
      "Authorization": `Bearer ${sessionToken || apiKey}`,
    },
  };

  const req = lib.request(options, (res) => {
    const newToken =
      res.headers["x-mcp-session-token"] ||
      res.headers["x-mcp-session-refresh"];
    if (newToken) sessionToken = newToken;

    let data = "";
    res.on("data", (chunk) => { data += chunk; });
    res.on("end", () => {
      try {
        callback(JSON.parse(data));
      } catch (e) {
        callback({
          jsonrpc: "2.0",
          id: payload.id,
          error: { code: -32603, message: `Invalid JSON from server: ${e.message}` },
        });
      }
    });
  });

  req.setTimeout(120000, () => {
    req.destroy();
    callback({
      jsonrpc: "2.0",
      id: payload.id,
      error: { code: -32003, message: "Request timed out (120s). The server may be busy." },
    });
  });

  req.on("error", (e) => {
    callback({
      jsonrpc: "2.0",
      id: payload.id,
      error: { code: -32003, message: `Cannot connect to VideoWeave: ${e.message}` },
    });
  });

  req.write(body);
  req.end();
}

const rl = readline.createInterface({ input: process.stdin, terminal: false });

rl.on("line", (line) => {
  line = line.trim();
  if (!line) return;

  let payload;
  try {
    payload = JSON.parse(line);
  } catch (e) {
    process.stdout.write(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: { code: -32700, message: `Parse error: ${e.message}` },
      }) + "\n"
    );
    return;
  }

  post(payload, (response) => {
    process.stdout.write(JSON.stringify(response) + "\n");
  });
});
