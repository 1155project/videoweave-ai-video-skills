---
name: "Guide: Upload & Setup"
description: |
  Task guide for creating/managing projects and getting files into VideoWeave.
  Start here for any new session before assembling or editing a timeline.
type: guide
---

# Guide: Upload & Setup

## When to Use This Guide

- Starting a new project, or listing/renaming/deleting existing ones
- Uploading a local file (video, audio, logo image) into a project
- Checking a project's credit/storage usage, or a file's stream details before editing it
- Cleaning up files (rename, delete, bulk-delete)

This is almost always the **first** guide loaded in a session — everything else in this
catalog needs a `project_id` and, usually, at least one `file_id` that this guide's tools
produce.

## Tools in This Guide

| Skill File | Tool Name | What It Does |
|---|---|---|
| `01_get_account_info.md` | `get_account_info` | Fetch user profile, credit balance, and subscription plan |
| `02_list_projects.md` | `list_projects` | List all projects for the user's account |
| `03_create_project.md` | `create_project` | Create a new video editing project |
| `04_get_project.md` | `get_project` | Get details for a specific project |
| `26_get_project_stats.md` | `get_project_stats` | Get credits consumed, storage used, and estimated USD cost for a project |
| `05_update_project.md` | `update_project` | Rename or update a project |
| `06_delete_project.md` | `delete_project` | Delete a project and all its files |
| `07_list_files.md` | `list_files` | List all files in a project |
| `08_upload_file.md` | `prepare_upload` (→ `confirm_upload`) | Register a file, transfer its bytes (client-dependent — see below), then confirm |
| `10_delete_file.md` | `delete_file` | Delete a file from a project |
| `57_rename_file.md` | `rename_file` | Rename a file's display name |
| `58_bulk_delete_files.md` | `bulk_delete_files` | Delete up to 100 files from a project in one call |
| `32_get_media_info.md` | `get_media_info` | List every video/audio stream in a file (codecs, channels, language). Free — synchronous. |

**Not in this guide:** `get_file_url` looks like it belongs here (it's a Files-category
tool), but its most common use is fetching the *finished, exported* video's download link —
see [`05_export.md`](./05_export.md), which is where it's documented in full. If you need a
URL for a freshly-uploaded raw file rather than a finished export, the same tool/skill file
applies; only its guide-level home moved.

## Sequencing Rules

```
get_account_info     → no dependencies
list_projects        → no dependencies
create_project       → no dependencies

get_project          → requires: project_id (from list_projects or create_project)
get_project_stats    → requires: project_id
update_project       → requires: project_id
delete_project       → requires: project_id

list_files           → requires: project_id
prepare_upload       → requires: project_id
delete_file          → requires: project_id, file_id
rename_file          → requires: project_id, file_id of file in project, filename (1-128 chars)
bulk_delete_files    → requires: project_id, file_ids (1-100) of files in project
get_media_info       → requires: project_id, file_id
```

`get_media_info` is the one tool in this guide that's synchronous but not a "setup" action
per se — it's here because it's a Files-category, free/no-job tool, and every guide that
needs a specific audio-track index (`remove_audio`, `extract_audio_track` in
[`04_audio.md`](./04_audio.md)) is told to call it first.

## Upload: which path applies to you

`08_upload_file.md` documents three branches, decided **before** calling `prepare_upload`:

1. **Local execution available** (a bash/shell tool, or the VideoWeave Desktop Extension) →
   call `prepare_upload`, then either the Desktop bridge's native `upload_file` tool or the
   `videoweave-upload` CLI, then `confirm_upload`.
2. **No local execution at all** (e.g. a browser-based chat client) → skip `prepare_upload`
   entirely; direct the user to VideoWeave's web UI instead. Covers `WORKING`/`AUDIO`/`LOGO`
   files only — see the atomic file for the current `INDEX`/`EXITING`/`BACKGROUND` gap.

Read `08_upload_file.md` in full before the first upload of a session — which branch applies
is a judgment call about your own runtime, not something this guide can decide for you.

## Credit Cost Awareness

Edit operations (in the other four guides) consume credits, not this guide's tools. Before
starting a session that will run several edit operations, call `get_account_info` to check
the balance, and consider `estimate_credits` (see [`05_export.md`](./05_export.md)) to price
an operation before running it.

## Output for Chaining

- `project_id` (from `create_project`/`list_projects`) → required by every other guide
- `file_id` (from `prepare_upload`+`confirm_upload`, or `list_files`) → required by
  [`02_assemble.md`](./02_assemble.md) to add a clip to the timeline
