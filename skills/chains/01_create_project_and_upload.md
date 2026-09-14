---
name: "create_project_and_upload"
description: |
  Full setup chain: create a new VideoWeave project, upload multiple local video files,
  and add them to the timeline in order.
type: chain
atomic_skills_used:
  - create_project
  - upload_file
  - add_clip_to_track
  - get_track
---

# Chain Skill: Create Project and Upload Files

## Purpose
A complete project setup workflow. Creates a new project, uploads all specified local
files, and adds them to the timeline in the order provided. Use this when the user wants
to start fresh with a new project and a set of local files.

## When to Use
- User says "create a project called X and upload all clips from folder Y"
- User says "set up a new project with these files: ..."
- Starting any new video editing workflow from local files

## Prerequisites
- The `videoweave-upload` CLI helper must be installed locally
- All specified files must exist at their local paths
- Sufficient storage quota (check with `get_account_info`)

---

## Step-by-Step Execution

### Step 1 — Check Account Info (optional but recommended)
Before starting, verify sufficient credits and storage.

```json
{ "tool": "get_account_info", "params": {} }
```

If `storage_used_mb` is near the limit, warn the user before proceeding.

---

### Step 2 — Create Project

```json
{
  "tool": "create_project",
  "params": {
    "title": "<user-provided project name>",
    "transition_type": "FADE"
  }
}
```

Save the returned `project_id` — it's needed for all remaining steps.

---

### Step 3 — Upload Files (repeat for each file)

For each file the user wants to upload:

**3a. Prepare the upload:**
```json
{
  "tool": "prepare_upload",
  "params": {
    "project_id": "<project_id from Step 2>",
    "filename": "<filename>",
    "file_type": "WORKING"
  }
}
```

Save the returned `file_id` and `upload_url`.

**3b. Execute the local upload:**
```bash
videoweave-upload --url "<upload_url>" --file "<local_path_to_file>"
```

If the agent environment supports running scripts, call this directly. Otherwise,
provide the command to the user and wait for confirmation before proceeding.

**Repeat 3a and 3b for each file.** Uploads can be done sequentially.

---

### Step 4 — Add Clips to Timeline (repeat for each file, in desired order)

For each uploaded file, in the order they should appear in the timeline:

```json
{
  "tool": "add_clip_to_track",
  "params": {
    "project_id": "<project_id>",
    "file_id": "<file_id from Step 3a>"
  }
}
```

---

### Step 5 — Verify Timeline

Confirm all clips are in the correct order:

```json
{
  "tool": "get_track",
  "params": {
    "project_id": "<project_id>"
  }
}
```

Present the clip order to the user for confirmation.

---

## Complete Example

User: "Create a new project called 'Training Series Episode 4' and upload all the
.mp4 files from my ~/recordings/ep4/ folder to it."

```
Step 1: get_account_info → 450MB free, 85 credits available ✓
Step 2: create_project("Training Series Episode 4") → project_id: abc-123
Step 3a: upload_file("scene01.mp4", WORKING) → file_id: f01, upload_url: ...
Step 3b: videoweave-upload --url "..." --file "~/recordings/ep4/scene01.mp4" ✓
Step 3a: upload_file("scene02.mp4", WORKING) → file_id: f02, upload_url: ...
Step 3b: videoweave-upload --url "..." --file "~/recordings/ep4/scene02.mp4" ✓
Step 3a: upload_file("scene03.mp4", WORKING) → file_id: f03, upload_url: ...
Step 3b: videoweave-upload --url "..." --file "~/recordings/ep4/scene03.mp4" ✓
Step 4: add_clip_to_track(abc-123, f01) → position 1
Step 4: add_clip_to_track(abc-123, f02) → position 2
Step 4: add_clip_to_track(abc-123, f03) → position 3
Step 5: get_track(abc-123) → [scene01 @ 1, scene02 @ 2, scene03 @ 3] ✓
```

Response to user:
"Project 'Training Series Episode 4' is set up! 3 clips uploaded and added to the
timeline in order: scene01 → scene02 → scene03. Ready to edit."

---

## Extending This Chain

After completing this chain, common next steps:

- **Edit clips:** Use `cut_video`, `add_text`, `add_logo`, etc. on individual clips
- **Add audio:** Upload an audio file (`file_type: AUDIO`) and use `add_audio` on clips
- **Finalize:** Once editing is done, use `finalize_video` to produce the output

---

## Authoring Your Own Chains

Use this skill as a template. A chain skill should:
1. List the atomic skills it uses in the frontmatter
2. Describe each step clearly with the exact MCP tool call
3. Show what to do with the output of each step
4. Include a concrete example
5. Describe natural extension points for further work
