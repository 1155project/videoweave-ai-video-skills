# VideoWeave MCP — Claude Context

You are connected to the **VideoWeave MCP server**, which gives you tools to control a
professional video editing platform on behalf of the user.

---

## What VideoWeave Does

VideoWeave is a cloud-based video editing platform. Users upload video clips, arrange them
on a timeline, apply effects (cuts, speed changes, text overlays, logos, audio), and
produce a final output video. All processing is done server-side.

---

## Your Tools (52 total)

You have six categories of tools. Call `tools/list` to see full parameter schemas.

### Account (1 tool)
- `get_account_info` — user profile, credit balance, plan name

### Projects (6 tools)
- `list_projects`, `create_project`, `get_project`, `get_project_stats`, `update_project`, `delete_project`

### Files (6 tools)
- `list_files`, `prepare_upload`, `get_file_url`, `delete_file`, `confirm_upload`
- `get_media_info` — list every video/audio stream in a file (codecs, channels, language). **Free — synchronous, not a job.**

### Timeline / Track (3 tools)
- `get_track`, `add_clip_to_track`, `remove_clip_from_track`

### Edit Operations — ASYNC (34 tools)
- `cut_video`, `join_videos`, `slow_video`, `speed_up_video`
- `add_audio`, `remove_audio` (optionally with `track_index` to remove one specific audio stream)
- `trim_clip`, `fade_clip`, `reverse_clip`, `adjust_audio_volume`, `extract_audio_track`
- `adjust_brightness`, `adjust_contrast`, `adjust_saturation`, `adjust_gamma`, `adjust_white_balance` —
  color correction, each one dimension, video only (audio untouched)
- `crop_video`, `rotate_video`, `flip_video` — geometric transforms, video only (audio untouched)
- `sharpen_video`, `blur_video`, `denoise_video`, `deblock_video` — quality fixes, each one
  dimension, video only (audio untouched); `deblock_video` takes no parameter
- `enhance_video` — a single one-call quality-improvement pass (color + sharpness + noise
  reduction together), video only (audio untouched); default is an active improvement, not a no-op
- `apply_vignette`, `apply_sepia`, `apply_grayscale`, `pixelate_video`, `apply_emboss`,
  `detect_edges` — stylistic/creative looks, video only (audio untouched); `apply_sepia`,
  `apply_grayscale`, `apply_emboss`, `detect_edges` take no tunable parameter.
  `apply_grayscale` is equivalent to `adjust_saturation` with `saturation=0`, offered as
  its own tool for discoverability
- `add_logo`, `add_text`
- `undo`, `finalize_video`

### Jobs (2 tools)
- `get_job_status`, `get_active_job`

---

## Critical Rules

### 1. Async edit operations MUST be polled

`cut_video`, `join_videos`, `slow_video`, `speed_up_video`, `add_audio`, `remove_audio`,
`trim_clip`, `fade_clip`, `reverse_clip`, `adjust_audio_volume`, `extract_audio_track`,
`adjust_brightness`, `adjust_contrast`, `adjust_saturation`, `adjust_gamma`,
`adjust_white_balance`, `crop_video`, `rotate_video`, `flip_video`, `sharpen_video`,
`blur_video`, `denoise_video`, `deblock_video`, `enhance_video`, `apply_vignette`,
`apply_sepia`, `apply_grayscale`, `pixelate_video`, `apply_emboss`, `detect_edges`,
`add_logo`, `add_text`, `finalize_video` all return immediately with a `job_id` and
`status: QUEUED`. They are NOT complete when they return.

**You must poll `get_job_status` every 3 seconds until status is `COMPLETED` or `FAILED`
before doing anything else with that project.**

Do not start a second edit operation until the first is `COMPLETED`. Use `get_active_job`
to check.

`get_media_info` is the one exception — it's synchronous (a direct media inspection, no job)
and returns its result immediately, same as `get_track`/`list_files`.

### 2. File uploads are two-step

You cannot access the user's local filesystem directly. To upload a file:

1. Call `prepare_upload` → get a `file_id` and `upload_url`
2. The user (or you, if you have a bash tool) must run:
   ```
   videoweave-upload --url "<upload_url>" --file "<local_path>"
   ```

If you cannot run shell commands, give the user this exact command and wait for them to
confirm it ran before proceeding.

### 3. Keep track of IDs across steps

Many operations chain. Save these as you go:
- `project_id` — from `create_project` or `list_projects`
- `file_id` — from `prepare_upload` or `list_files`
- `job_id` — from any async edit tool

### 4. Track snapshots before destructive edits

Before any edit that changes the timeline (cut, join, add_text, etc.), call `get_track`
and save the result. If the user wants to undo, pass that saved list to `undo`.

### 5. Check credits before expensive sessions

Call `get_account_info` at the start of any session involving multiple edit operations.
Each edit costs roughly 10–25 credits. If `credits_remaining` is low, warn the user.

### 6. File types matter

When uploading, `file_type` controls how a file is used:
- `WORKING` — standard video clip (default)
- `AUDIO` — for use with `add_audio` (the `audio_file_id` parameter)
- `LOGO` — PNG/JPG for use with `add_logo` (the `logo_id` parameter)
- `INDEX` — intro clip (auto-prepended by `finalize_video`)
- `EXITING` — outro clip (auto-appended by `finalize_video`)

If the user uploads an audio file but you register it as `WORKING`, `add_audio` will
reject it. Always match file type to intended use.

---

## Common Patterns

### New project from local files
```
create_project → prepare_upload (×N) → [user runs videoweave-upload] → add_clip_to_track (×N) → get_track
```

### Cut a clip at a timestamp
```
get_track [find file_id] → cut_video (project_id, file_id, timestamp) → poll get_job_status → get_track
```

### Add text overlay
```
add_text (project_id, file_id, text, position_x=50, position_y=80) → poll → get_track
```

### Finalize and download
```
get_track [verify clips in order] → finalize_video → poll until COMPLETED → get_file_url [for OUTPUT file]
```

### Undo last operation
```
Before edit: get_track → save clips list
After edit:  undo (project_id, clips=[saved list])
```

### Inspect and remove/extract a specific audio track
```
get_track [find file_id] → get_media_info (project_id, file_id)
  [note the type-relative index in audio_streams]
→ remove_audio (project_id, file_id, track_index) OR extract_audio_track (project_id, file_id, track_index)
→ poll get_job_status
```
Never guess a `track_index` — always call `get_media_info` first. An out-of-range
index returns `400` immediately, not a job that fails later.

---

## Error Handling

| Error | Action |
|-------|--------|
| `401` | Tell user their session expired; they need to reconnect with API key |
| `404 Project not found` | Call `list_projects` to confirm the correct project_id |
| `PAYMENT_REQUIRED` in job failure | User needs to buy credits at videoweave.io/billing |
| `FAILED` job with error_message | Show the error to user; suggest retry or alternative approach |
| Upload URL expired | Call `prepare_upload` again for a fresh URL |
| `400` on `remove_audio`/`extract_audio_track` (track_index out of range) | Call `get_media_info` to see the actual audio stream count, then retry |

---

## Connection Methods

**Claude Desktop**: Uses `videoweave-mcp-bridge` (local stdio proxy). The bridge handles
session token caching automatically — you never need to manage tokens manually. When
connected via the Desktop Extension, the bridge also exposes a local `upload_file` tool
— call it directly with `file_path`/`upload_url` instead of instructing the user to run
the `videoweave-upload` CLI.

**Claude Code CLI**: Connects directly to `https://api.videoweave.io/mcp/v1` via HTTP.
Session tokens are managed per the `X-MCP-Session-Token` / `X-MCP-Session-Refresh` headers.

**API key format**: Always starts with `vw_`. Generated at VideoWeave → Settings → API Keys.

---

## Skill Documents

Detailed, step-by-step instructions for every tool are in `skills/atomic/`.
The manifest (`skills/atomic/00_skill_manifest.md`) is the master reference.
Load it at the start of any VideoWeave session for dependency rules and patterns.
