---
name: "Guide: Assemble"
description: |
  Task guide for building and reshaping the timeline itself — inspecting
  clips, adding/removing them, cutting/trimming/joining, and time-remapping.
type: guide
---

# Guide: Assemble

## When to Use This Guide

- Building the timeline from uploaded files
- Deciding where to cut/trim a clip (inspect first, then act)
- Joining clips together, splitting one into two, speeding up/slowing down/reversing/fading
- Undoing the last change

This is the "skim → inspect → select → trim → assemble" workflow: the visual-sampling
tools here exist specifically to give you evidence for the structural decisions the rest
of this guide's tools make.

## Tools in This Guide

| Skill File | Tool Name | What It Does |
|---|---|---|
| `11_get_track.md` | `get_track` | Get the current clip order in the project timeline |
| `12_add_clip_to_track.md` | `add_clip_to_track` | Add an uploaded file to the timeline |
| `13_remove_clip_from_track.md` | `remove_clip_from_track` | Remove a clip from the timeline |
| `59_get_media_frame.md` | `get_media_frame` | Extract a single frame at a timestamp as a viewable image — returned **inline**, no extra fetch needed |
| `60_get_media_frames.md` | `get_media_frames` | Extract a series of frames over a time range (max 50/call) — URL-only, for building a batch |
| `61_get_contact_sheet.md` | `get_contact_sheet` | Build one grid image of evenly-spaced sample frames — returned **inline** |
| `14_cut_video.md` | `cut_video` | Split a clip at a timestamp |
| `27_trim_clip.md` | `trim_clip` | Extract a `[start_time, end_time]` sub-segment as one new clip |
| `15_join_videos.md` | `join_videos` | Merge multiple clips into one |
| `16_slow_video.md` | `slow_video` | Slow down a clip (2x, 3x, or 4x) |
| `17_speed_up_video.md` | `speed_up_video` | Speed up a clip (2x or 3x) |
| `28_fade_clip.md` | `fade_clip` | Fade a clip in and/or out (video + audio) |
| `29_reverse_clip.md` | `reverse_clip` | Reverse a clip's playback (video + audio) |
| `22_undo.md` | `undo` | Restore the timeline to its previous state |

**Why `get_media_frame`/`get_media_frames`/`get_contact_sheet` live here, not in
[`03_look_and_color.md`](./03_look_and_color.md):** they're used to decide *where* to cut
and *which* clip to act on — an assemble-stage decision — even though they're equally
useful for judging whether a color/look adjustment is needed. If you're inspecting footage
specifically to evaluate a visual effect, the tools are the same; just come to this guide
for them.

## Sequencing Rules

```
get_track              → requires: project_id
add_clip_to_track      → requires: project_id, file_id (must call prepare_upload +
                          confirm_upload first — see 01_upload_and_setup.md)
remove_clip_from_track → requires: project_id, file_id

get_media_frame        → requires: project_id, file_id, timestamp
get_media_frames       → requires: project_id, file_id, start, end, interval.
                          (end - start) / interval must not exceed 50.
get_contact_sheet      → requires: project_id, file_id. Optional samples (2-12, default 6).

cut_video              → requires: project_id, file_id of clip in track
trim_clip              → requires: project_id, file_id of clip in track, start_time, end_time
join_videos            → requires: project_id, file_ids of 2+ clips in track
slow_video             → requires: project_id, file_id of clip in track
speed_up_video         → requires: project_id, file_id of clip in track
fade_clip              → requires: project_id, file_id of clip in track
reverse_clip           → requires: project_id, file_id of clip in track (rejected if the
                          clip is very long — reversing buffers the whole clip in memory)
undo                   → requires: project_id, previous track snapshot (returned by get_track)
```

All of `cut_video`, `trim_clip`, `join_videos`, `slow_video`, `speed_up_video`,
`fade_clip`, `reverse_clip` are **async** — poll `get_job_status` until `COMPLETED` before
your next call. `get_track`/`get_media_frame`/`get_media_frames`/`get_contact_sheet` are
synchronous.

## Gotcha: the supersede + replace pattern

**Every edit operation in this guide (and in [`03_look_and_color.md`](./03_look_and_color.md)
and [`04_audio.md`](./04_audio.md)) creates a *new* file and marks the source file
`SUPERSEDED` — it will not appear in `list_files` afterward.** This is by design, not data
loss: the original bytes still exist (superseded files are retained for lineage), but the
timeline now points at the new file's ID. If you cut, trim, join, or apply any effect and
then call `list_files` looking for the clip you started with, it won't be there — call
`get_track` instead to find the clip's *current* file_id on the timeline. Every completed
job's response now also includes `output_file_id` directly (see
[`05_export.md`](./05_export.md)'s Job Transparency section) — you don't have to
`list_files`/`get_track` after every single edit just to learn what was produced.

## Undo pattern

```
1. get_track             → save current snapshot (clips list)
   [edit operation runs]
2. undo                  → pass the saved snapshot → timeline restored
```
Always snapshot with `get_track` *before* any edit you might want to undo — `undo` needs
that snapshot passed back to it, it doesn't remember state on its own.

## Output for Chaining

- `file_id` (new, post-edit) → chain into the next assemble/look-and-color/audio operation,
  or into `finalize_video` (see [`05_export.md`](./05_export.md)) once the timeline is final
