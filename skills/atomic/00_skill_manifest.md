---
name: "VideoWeave Skill Manifest"
description: |
  Master catalog of all VideoWeave MCP skills. Load this file at session start to
  understand available capabilities, dependencies, and common multi-step patterns.
type: manifest
---

# VideoWeave MCP Skill Manifest

Load this manifest at the start of any VideoWeave session. It tells you what you can do,
what order operations must happen in, and which skills to chain for common tasks.

---

## Prerequisites for All Skills

Before calling any other skill, you must have an active MCP session. The session is
established automatically when your LLM client connects to the VideoWeave MCP server
using your configured API key. You do not need to call an authenticate skill explicitly —
authentication is handled at connection time.

---

## Skill Catalog

### Account
| Skill File | Tool Name | What It Does |
|---|---|---|
| `01_get_account_info.md` | `get_account_info` | Fetch user profile, credit balance, and subscription plan |

### Projects
| Skill File | Tool Name | What It Does |
|---|---|---|
| `02_list_projects.md` | `list_projects` | List all projects for the user's account |
| `03_create_project.md` | `create_project` | Create a new video editing project |
| `04_get_project.md` | `get_project` | Get details for a specific project |
| `26_get_project_stats.md` | `get_project_stats` | Get credits consumed, storage used, and estimated USD cost for a project |
| `05_update_project.md` | `update_project` | Rename or update a project |
| `06_delete_project.md` | `delete_project` | Delete a project and all its files |

### Files
| Skill File | Tool Name | What It Does |
|---|---|---|
| `07_list_files.md` | `list_files` | List all files in a project |
| `08_upload_file.md` | `prepare_upload` | Register a file and get a presigned upload URL; then run `videoweave-upload` CLI |
| `09_get_file_url.md` | `get_file_url` | Get a presigned URL to view or download a file |
| `10_delete_file.md` | `delete_file` | Delete a file from a project |
| `57_rename_file.md` | `rename_file` | Rename a file's display name |
| `58_bulk_delete_files.md` | `bulk_delete_files` | Delete up to 100 files from a project in one call |
| `32_get_media_info.md` | `get_media_info` | List every video/audio stream in a file (codecs, channels, language). Free — synchronous, no job. |

### Track Management
| Skill File | Tool Name | What It Does |
|---|---|---|
| `11_get_track.md` | `get_track` | Get the current clip order in the project timeline |
| `12_add_clip_to_track.md` | `add_clip_to_track` | Add an uploaded file to the timeline |
| `13_remove_clip_from_track.md` | `remove_clip_from_track` | Remove a clip from the timeline |

### Media Inspection (Free — synchronous, deterministic signals only, never semantic judgments)
| Skill File | Tool Name | What It Does |
|---|---|---|
| `59_get_media_frame.md` | `get_media_frame` | Extract a single frame at a timestamp as a viewable image |
| `60_get_media_frames.md` | `get_media_frames` | Extract a series of frames over a time range at a fixed interval (max 50 per call) |
| `61_get_contact_sheet.md` | `get_contact_sheet` | Build one grid image of evenly-spaced sample frames across a clip |
| `62_get_waveform.md` | `get_waveform` | Generate a waveform image of a clip's full audio track |
| `63_get_audio_segment.md` | `get_audio_segment` | Extract a time-bounded audio clip (max 300 seconds) |
| `64_detect_scene_changes.md` | `detect_scene_changes` | Detect timestamps where the visual content changes significantly |
| `65_detect_silence.md` | `detect_silence` | Detect time ranges where the audio track is below a noise threshold |

### Annotations (VideoWeave stores these; it never generates or validates them)
| Skill File | Tool Name | What It Does |
|---|---|---|
| `66_set_file_annotations.md` | `set_file_annotations` | Store your own semantic conclusions about a file (additive, not overwrite) |
| `67_get_file_annotations.md` | `get_file_annotations` | Retrieve previously stored annotations for a file, newest first |

### Edit Operations (Async — always poll job status after calling)
| Skill File | Tool Name | What It Does |
|---|---|---|
| `14_cut_video.md` | `cut_video` | Split a clip at a timestamp |
| `15_join_videos.md` | `join_videos` | Merge multiple clips into one |
| `16_slow_video.md` | `slow_video` | Slow down a clip (2x, 3x, or 4x) |
| `17_speed_up_video.md` | `speed_up_video` | Speed up a clip (2x or 3x) |
| `18_add_audio.md` | `add_audio` | Add or replace audio on a clip |
| `19_remove_audio.md` | `remove_audio` | Strip audio from a clip — all of it, or one specific track |
| `20_add_logo.md` | `add_logo` | Overlay a logo/watermark on a clip |
| `21_add_text.md` | `add_text` | Add a text overlay to a clip |
| `22_undo.md` | `undo` | Restore the timeline to its previous state |
| `23_finalize_video.md` | `finalize_video` | Join all timeline clips into a final output video |
| `27_trim_clip.md` | `trim_clip` | Extract a [start_time, end_time] sub-segment as one new clip |
| `28_fade_clip.md` | `fade_clip` | Fade a clip in and/or out (video + audio) |
| `29_reverse_clip.md` | `reverse_clip` | Reverse a clip's playback (video + audio) |
| `30_adjust_audio_volume.md` | `adjust_audio_volume` | Adjust a clip's own audio gain by a multiplier |
| `31_extract_audio_track.md` | `extract_audio_track` | Save one audio stream from a clip as a standalone AUDIO file |
| `33_adjust_brightness.md` | `adjust_brightness` | Adjust a clip's brightness |
| `34_adjust_contrast.md` | `adjust_contrast` | Adjust a clip's contrast |
| `35_adjust_saturation.md` | `adjust_saturation` | Adjust a clip's color saturation |
| `36_adjust_gamma.md` | `adjust_gamma` | Adjust a clip's gamma (midtone brightness) |
| `37_adjust_white_balance.md` | `adjust_white_balance` | Adjust a clip's color balance via per-channel gamma |
| `38_crop_video.md` | `crop_video` | Crop a clip to a pixel rectangle |
| `39_rotate_video.md` | `rotate_video` | Rotate a clip by 90, 180, or 270 degrees |
| `40_flip_video.md` | `flip_video` | Mirror a clip horizontally or vertically |
| `41_sharpen_video.md` | `sharpen_video` | Sharpen a clip |
| `42_blur_video.md` | `blur_video` | Blur a clip |
| `43_denoise_video.md` | `denoise_video` | Reduce noise/grain in a clip |
| `44_deblock_video.md` | `deblock_video` | Reduce compression blockiness in a clip |
| `45_enhance_video.md` | `enhance_video` | Apply a single quality-improvement pass combining color, sharpness, and noise reduction |
| `46_apply_vignette.md` | `apply_vignette` | Apply a vignette effect (darkened edges) to a clip |
| `47_apply_sepia.md` | `apply_sepia` | Apply a sepia tone to a clip |
| `48_apply_grayscale.md` | `apply_grayscale` | Convert a clip to grayscale (equivalent to adjust_saturation with saturation=0) |
| `49_pixelate_video.md` | `pixelate_video` | Apply a pixelation/mosaic effect to a clip |
| `50_apply_emboss.md` | `apply_emboss` | Apply an emboss/relief effect to a clip |
| `51_detect_edges.md` | `detect_edges` | Apply an edge-detection outline effect to a clip |
| `52_zoom_video.md` | `zoom_video` | Animate a zoom from one level to another across the whole clip |
| `53_pan_video.md` | `pan_video` | Pan across the frame in one direction at a fixed zoom level, across the whole clip |
| `54_ken_burns_video.md` | `ken_burns_video` | Apply an animated zoom-and-pan (Ken Burns) effect to a clip |
| `55_apply_chroma_key.md` | `apply_chroma_key` | Composite a green/blue-screen clip onto a background image |
| `56_convert_frame_rate.md` | `convert_frame_rate` | Convert a clip to a target frame rate |

### Jobs
| Skill File | Tool Name | What It Does |
|---|---|---|
| `24_get_job_status.md` | `get_job_status` | Check the status of an async edit job |
| `25_get_active_job.md` | `get_active_job` | Check if any job is currently running for a project |

---

## Dependency Rules

These rules must be satisfied before a skill can run:

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
get_file_url         → requires: project_id, file_id (from list_files or upload_file)
delete_file          → requires: project_id, file_id
rename_file          → requires: project_id, file_id of file in project, filename (1-128 chars)
bulk_delete_files    → requires: project_id, file_ids (1-100) of files in project
get_media_info       → requires: project_id, file_id

get_track            → requires: project_id
add_clip_to_track    → requires: project_id, file_id (must call prepare_upload + videoweave-upload first)
remove_clip_from_track → requires: project_id, file_id

get_media_frame      → requires: project_id, file_id, timestamp
get_media_frames     → requires: project_id, file_id, start, end, interval.
                        (end - start) / interval must not exceed 50.
get_contact_sheet    → requires: project_id, file_id. Optional samples (2-12, default 6).
get_waveform         → requires: project_id, file_id. File must have an audio stream.
get_audio_segment    → requires: project_id, file_id, start, end. end - start must not
                        exceed 300 seconds. File must have an audio stream.
detect_scene_changes → requires: project_id, file_id. Optional threshold (0.0-1.0, default 0.4).
detect_silence       → requires: project_id, file_id. Optional noise_db (default -30),
                        min_duration (default 0.5).

set_file_annotations → requires: project_id, file_id, annotations (object). Optional
                        confidence (0.0-1.0), evidence (object), review_state
                        (UNREVIEWED/CONFIRMED/REJECTED, default UNREVIEWED). Additive —
                        each call creates a new entry, never overwrites a prior one.
get_file_annotations → requires: project_id, file_id

cut_video            → requires: project_id, file_id of clip in track
join_videos          → requires: project_id, file_ids of 2+ clips in track
slow_video           → requires: project_id, file_id of clip in track
speed_up_video       → requires: project_id, file_id of clip in track
add_audio            → requires: project_id, file_id (video clip), audio_file_id (AUDIO type)
remove_audio         → requires: project_id, file_id of clip in track. Optional track_index
                        (see get_media_info) removes one specific audio stream instead of all.
add_logo             → requires: project_id, file_id (video clip), logo_file_id (LOGO type)
add_text             → requires: project_id, file_id of clip in track
undo                 → requires: project_id, previous track snapshot (returned by get_track)
finalize_video       → requires: project_id, at least one clip in track
trim_clip            → requires: project_id, file_id of clip in track, start_time, end_time
fade_clip            → requires: project_id, file_id of clip in track
reverse_clip         → requires: project_id, file_id of clip in track (rejected if clip is
                        very long — reversing requires buffering the whole clip in memory)
adjust_audio_volume  → requires: project_id, file_id of clip in track
extract_audio_track  → requires: project_id, file_id of clip in track. Optional track_index
                        (see get_media_info) selects which audio stream to save; does NOT
                        modify the source clip.
adjust_brightness    → requires: project_id, file_id of clip in track. Video only — audio untouched.
adjust_contrast      → requires: project_id, file_id of clip in track. Video only — audio untouched.
adjust_saturation    → requires: project_id, file_id of clip in track. Video only — audio untouched.
                        saturation=0.0 produces a fully grayscale output.
adjust_gamma         → requires: project_id, file_id of clip in track. Video only — audio untouched.
adjust_white_balance → requires: project_id, file_id of clip in track. Video only — audio untouched.
                        Set red/green/blue independently; each defaults to 1.0 (no-op).
crop_video           → requires: project_id, file_id of clip in track, x, y, width, height.
                        Video only — audio untouched. Call get_media_info first to learn
                        actual pixel dimensions; an out-of-bounds rectangle is rejected (400)
                        when dimensions are known.
rotate_video         → requires: project_id, file_id of clip in track, degrees (90/180/270 only).
                        Video only — audio untouched. 90/270 swap width and height.
flip_video           → requires: project_id, file_id of clip in track, direction
                        ("horizontal" or "vertical"). Video only — audio untouched.
sharpen_video        → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. Optional amount (0.0-5.0, default 0.0 no-op).
blur_video           → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. Optional amount (0.0-20.0, default 0.0 no-op).
denoise_video        → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. Optional amount (0.0-3.0, default 0.0 no-op).
deblock_video        → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. No tunable parameter.
enhance_video        → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. Optional strength (0.0-1.0, default 0.5 —
                        an active improvement, not a no-op).
apply_vignette       → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. Optional strength (0.0-1.0, default 0.0 no-op).
apply_sepia          → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. No tunable parameter.
apply_grayscale      → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. No tunable parameter. Equivalent to
                        adjust_saturation(saturation=0); exists for discoverability.
pixelate_video       → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. Optional block_size (1-64, default 1 no-op).
apply_emboss         → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. No tunable parameter.
detect_edges         → requires: project_id, file_id of clip in track. Video only —
                        audio untouched. No tunable parameter.
zoom_video           → requires: project_id, file_id of clip in track, start_zoom,
                        end_zoom. Video only — audio untouched. Animates across the
                        whole clip; no timeline-windowing support.
pan_video            → requires: project_id, file_id of clip in track, direction,
                        distance. Video only — audio untouched. Animates across the
                        whole clip; no timeline-windowing support.
ken_burns_video      → requires: project_id, file_id of clip in track, start_zoom,
                        end_zoom. Video only — audio untouched. Animates across the
                        whole clip; no timeline-windowing support.
apply_chroma_key     → requires: project_id, file_id of clip in track,
                        background_file_id of an image file. Video only —
                        audio from the foreground clip is preserved.
                        Background must be a still image; video backgrounds
                        not yet supported.
convert_frame_rate   → requires: project_id, file_id of clip in track, target_fps
                        (0 < target_fps <= 120). Video only — audio untouched.

get_job_status       → requires: project_id, job_id (returned by any edit operation)
get_active_job       → requires: project_id
```

---

## Async Operation Rule

**CRITICAL:** The following skills are asynchronous — they return a `job_id` with status
`QUEUED`, not a result. You MUST call `get_job_status` repeatedly until status is
`COMPLETED` or `FAILED` before proceeding.

Async skills: `cut_video`, `join_videos`, `slow_video`, `speed_up_video`, `add_audio`,
`remove_audio`, `add_logo`, `add_text`, `finalize_video`, `trim_clip`, `fade_clip`,
`reverse_clip`, `adjust_audio_volume`, `extract_audio_track`, `adjust_brightness`,
`adjust_contrast`, `adjust_saturation`, `adjust_gamma`, `adjust_white_balance`,
`crop_video`, `rotate_video`, `flip_video`, `sharpen_video`, `blur_video`,
`denoise_video`, `deblock_video`, `enhance_video`, `apply_vignette`, `apply_sepia`,
`apply_grayscale`, `pixelate_video`, `apply_emboss`, `detect_edges`, `zoom_video`,
`pan_video`, `ken_burns_video`, `apply_chroma_key`, `convert_frame_rate`

`get_media_info` is the one exception — it's synchronous (a direct media inspection, no
background job) and returns its result immediately, same as `get_track`/`list_files`.

Poll interval: 3 seconds. Typical completion time: 5–30 seconds depending on clip length.

---

## Common Multi-Step Patterns

### Pattern: Create project and upload clips
```
1. create_project        → project_id
2. upload_file (×N)      → file_id for each file
3. add_clip_to_track (×N) → clips appear in timeline
4. get_track             → verify clip order
```

### Pattern: Edit a clip and verify
```
1. get_track             → get current clip list, note file_id
2. cut_video / slow_video / add_text / etc. → job_id
3. get_job_status (poll) → wait for COMPLETED
4. get_track             → verify updated timeline
```

### Pattern: Add audio to a clip
```
1. list_files            → find audio file_id (type AUDIO), or:
2. upload_file           → upload audio file (file_type: AUDIO) → audio_file_id
3. add_audio             → job_id (provide video file_id + audio_file_id)
4. get_job_status (poll) → wait for COMPLETED
```

### Pattern: Add branding and finalize
```
1. get_track             → verify all clips are in order
2. add_logo (×N)         → apply logo to each clip, poll each job
3. finalize_video        → job_id (joins all clips with optional intro/outro/logo)
4. get_job_status (poll) → wait for COMPLETED
5. get_file_url          → get download URL for the OUTPUT file
```

### Pattern: Undo last operation
```
1. get_track             → save current snapshot (clips list)
   [edit operation runs]
2. undo                  → pass the saved snapshot → timeline restored
```

### Pattern: Inspect and remove/extract a specific audio track
```
1. get_track             → get current clip list, note file_id
2. get_media_info        → list audio_streams for that file_id, note the
                            type-relative index of the track to target
3. remove_audio (with track_index) OR extract_audio_track (with track_index)
                         → job_id
4. get_job_status (poll) → wait for COMPLETED
```
Always call `get_media_info` first when targeting a specific track — never guess
an index. A `track_index` beyond the actual audio stream count returns `400`
immediately (not a queued job that fails later).

---

## Credit Cost Awareness

Edit operations consume credits. Before executing a series of edit operations, call
`get_account_info` to verify sufficient credits are available. The approximate cost
per operation is 21–30 credits depending on clip duration and resolution.

If a job fails with a `PAYMENT_REQUIRED` error, the user needs to purchase more credits
from their VideoWeave account before continuing.

---

## Chain Skills

For complex multi-step workflows, see the chain skills in `../chains/`:

| Chain Skill | What It Does |
|---|---|
| `01_create_project_and_upload.md` | Full flow: create project, upload files, add to timeline |

Users and developers can author additional chain skills by composing atomic skills.
Each chain skill references the atomic skills it uses by tool name.
