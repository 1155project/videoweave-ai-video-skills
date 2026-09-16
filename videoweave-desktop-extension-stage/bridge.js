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
const fs = require("fs");
const os = require("os");

const DEFAULT_URL = "https://stageapi.videoweave.io/mcp/v1";
const MAX_FILE_SIZE_BYTES = 500 * 1024 * 1024; // 500 MB, matches documented file constraints
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

const UPLOAD_FILE_TOOL = {
  name: "upload_file",
  description:
    "Upload a local file to VideoWeave using a presigned URL from prepare_upload. " +
    "Runs locally — the file is streamed directly from this machine, never through the LLM.",
  inputSchema: {
    type: "object",
    properties: {
      file_path: {
        type: "string",
        description: "Local path to the file to upload. '~' is expanded to the home directory.",
      },
      upload_url: {
        type: "string",
        description: "Presigned upload URL returned by the prepare_upload MCP tool.",
      },
    },
    required: ["file_path", "upload_url"],
  },
};

function humanSize(bytes) {
  for (const unit of ["B", "KB", "MB", "GB"]) {
    if (bytes < 1024) return `${bytes.toFixed(1)} ${unit}`;
    bytes /= 1024;
  }
  return `${bytes.toFixed(1)} TB`;
}

function toolResult(id, text, isError) {
  return {
    jsonrpc: "2.0",
    id,
    result: { content: [{ type: "text", text }], isError: !!isError },
  };
}

function uploadFile(filePath, uploadUrl, callback) {
  if (!filePath || !uploadUrl) {
    callback({ text: "Both file_path and upload_url are required.", isError: true });
    return;
  }

  const resolvedPath =
    filePath.startsWith("~") ? filePath.replace(/^~/, os.homedir()) : filePath;

  let stats;
  try {
    stats = fs.statSync(resolvedPath);
  } catch (e) {
    callback({ text: `File not found: ${resolvedPath}`, isError: true });
    return;
  }

  if (!stats.isFile()) {
    callback({ text: `Not a file: ${resolvedPath}`, isError: true });
    return;
  }

  if (stats.size > MAX_FILE_SIZE_BYTES) {
    callback({
      text: `File too large: ${humanSize(stats.size)} exceeds the 500 MB limit.`,
      isError: true,
    });
    return;
  }

  let url;
  try {
    url = new URL(uploadUrl);
  } catch (e) {
    callback({ text: `Invalid upload_url: ${e.message}`, isError: true });
    return;
  }
  const lib = url.protocol === "https:" ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname + (url.search || ""),
    method: "PUT",
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Length": String(stats.size),
    },
  };

  const req = lib.request(options, (res) => {
    let body = "";
    res.on("data", (chunk) => { body += chunk; });
    res.on("end", () => {
      if (res.statusCode === 200 || res.statusCode === 204) {
        callback({
          text: `Upload complete: ${resolvedPath.split(/[\\/]/).pop()} (${humanSize(stats.size)})`,
          isError: false,
        });
      } else {
        callback({
          text: `Upload failed — HTTP ${res.statusCode}: ${body.slice(0, 500)}`,
          isError: true,
        });
      }
    });
  });

  req.setTimeout(3600000, () => {
    req.destroy();
    callback({ text: "Upload timed out (3600s). The connection may be too slow.", isError: true });
  });

  req.on("error", (e) => {
    callback({ text: `Upload failed: ${e.message}`, isError: true });
  });

  const readStream = fs.createReadStream(resolvedPath);
  readStream.on("error", (e) => {
    callback({ text: `Failed to read file: ${e.message}`, isError: true });
    req.destroy();
  });
  readStream.pipe(req);
}

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

  if (payload.method === "tools/call" && payload.params && payload.params.name === "upload_file") {
    const args = payload.params.arguments || {};
    uploadFile(args.file_path, args.upload_url, ({ text, isError }) => {
      process.stdout.write(JSON.stringify(toolResult(payload.id, text, isError)) + "\n");
    });
    return;
  }

  post(payload, (response) => {
    if (
      payload.method === "tools/list" &&
      response &&
      response.result &&
      Array.isArray(response.result.tools)
    ) {
      response.result.tools.push(UPLOAD_FILE_TOOL);
    }
    process.stdout.write(JSON.stringify(response) + "\n");
  });
});
