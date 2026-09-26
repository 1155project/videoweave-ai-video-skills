---
name: "Guide: Export"
description: |
  Task guide for finishing a project — finalizing the output video, tracking
  job status/cost, downloading the result, and recording semantic annotations.
type: guide
---

# Guide: Export

## When to Use This Guide

- The timeline is final and you're ready to produce the output video
- Checking on any async job (from any of the other four guides), including what it
  produced and what it cost
- Estimating the cost of an operation before running it
- Getting a download link for a file — including, most commonly, the finished export
- Recording or retrieving your own semantic notes about a file (annotations)

## Tools in This Guide

| Skill File | Tool Name | What It Does |
|---|---|---|
| `23_finalize_video.md` | `finalize_video` | Join all timeline clips into a final output video, with optional intro/outro/logo |
| `24_get_job_status.md` | `get_job_status` | Check the status of an async edit job — now includes `output_file_id` and `credits_charged` |
| `25_get_active_job.md` | `get_active_job` | Check if any job is currently running for a project — same new fields |
| *(no atomic file yet — documented below)* | `estimate_credits` | Estimate the credit cost of an operation before running it. Free — synchronous, no job. |
| `09_get_file_url.md` | `get_file_url` | Get a presigned URL to view or download a file — most often the finished `OUTPUT` file |
| `66_set_file_annotations.md` | `set_file_annotations` | Store your own semantic conclusions about a file (additive, not overwrite) |
| `67_get_file_annotations.md` | `get_file_annotations` | Retrieve previously stored annotations for a file, newest first |

## Sequencing Rules

```
finalize_video       → requires: project_id, at least one clip in track
get_job_status       → requires: project_id, job_id (returned by any edit operation)
get_active_job       → requires: project_id
estimate_credits     → requires: operation_type (string). Optional duration_seconds
                        (default 0.0), resolution (default "720p").
get_file_url         → requires: project_id, file_id
set_file_annotations → requires: project_id, file_id, annotations (object). Optional
                        confidence (0.0-1.0), evidence (object), review_state
                        (UNREVIEWED/CONFIRMED/REJECTED, default UNREVIEWED). Additive —
                        each call creates a new entry, never overwrites a prior one.
get_file_annotations → requires: project_id, file_id
```

`finalize_video` is **async** — poll `get_job_status` until `COMPLETED`. Everything else
in this guide is synchronous.

## Job Transparency: output_file_id and credits_charged

`get_job_status` and `get_active_job` now return two fields that used to require a
separate `list_files`/`get_track` round trip to learn:

```json
{
  "job_id": "...",
  "status": "COMPLETED",
  "operation": "video.join.clips",
  "created_at": "...",
  "completed_at": "...",
  "error_message": null,
  "output_file_id": "abc-123",
  "credits_charged": 24
}
```

- **`output_file_id`** is the file the job produced, already resolvable without a follow-up
  call — `null` for operations that don't produce a file (there are none among the async
  edit tools today, but treat `null` as valid, not an error, if you ever see it).
- **`credits_charged`** is the actual credits deducted for this specific job, looked up
  directly from the billing ledger — not an estimate.

## estimate_credits: price it before you run it

```json
{
  "tool": "estimate_credits",
  "params": {"operation_type": "join", "duration_seconds": 90.0, "resolution": "1080p"}
}
```
Returns `{"estimated_credits": 24}`. This calls the **exact same cost calculation** every
real job creation path already uses — the number can never drift from what you'll actually
be charged. If `operation_type` isn't a recognized key, you still get back a usable
default estimate rather than an error; treat a suspiciously flat/generic-looking number as
a sign the operation type wasn't recognized, not as a bug.

Call this before a batch of expensive operations (e.g. several `enhance_video` calls on
long clips) if you want to warn the user of the total cost up front, or check
`get_account_info` (see [`01_upload_and_setup.md`](./01_upload_and_setup.md)) for the
current balance alongside it.

## Finalize and download

```
1. get_track             → verify all clips are in order (02_assemble.md)
2. add_logo (×N)         → apply logo to each clip if desired, poll each job
                            (03_look_and_color.md)
3. finalize_video        → job_id (joins all clips with optional intro/outro/logo)
4. get_job_status (poll) → wait for COMPLETED; read output_file_id directly from the response
5. get_file_url          → get download URL for the output file (using output_file_id)
```

Note `output_file_id`'s `str | null` field on the completed job means step 5 no longer
needs a `list_files` call to find the `OUTPUT`-type file first — the ID is already in
step 4's response.
