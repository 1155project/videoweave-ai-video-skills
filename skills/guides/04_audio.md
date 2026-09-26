---
name: "Guide: Audio"
description: |
  Task guide for everything audio-only — adding/removing/replacing tracks,
  volume, extraction, plus the audio-specific inspection tools (waveform,
  audio segment playback, silence detection).
type: guide
---

# Guide: Audio

## When to Use This Guide

- Adding a voiceover or music track to a clip, or replacing/removing its existing audio
- Adjusting a clip's own audio gain
- Saving one audio stream out as a standalone file
- Inspecting audio before acting on it: waveform, a listenable segment, or detecting silence

## Tools in This Guide

| Skill File | Tool Name | What It Does |
|---|---|---|
| `62_get_waveform.md` | `get_waveform` | Generate a waveform image of a clip's full audio track — returned **inline** |
| `63_get_audio_segment.md` | `get_audio_segment` | Extract a time-bounded audio clip (max 300 seconds) |
| `65_detect_silence.md` | `detect_silence` | Detect time ranges where the audio track is below a noise threshold |
| `18_add_audio.md` | `add_audio` | Add or replace audio on a clip |
| `19_remove_audio.md` | `remove_audio` | Strip audio from a clip — all of it, or one specific track |
| `30_adjust_audio_volume.md` | `adjust_audio_volume` | Adjust a clip's own audio gain by a multiplier |
| `31_extract_audio_track.md` | `extract_audio_track` | Save one audio stream from a clip as a standalone AUDIO file (does not modify the source clip) |

## Sequencing Rules

```
get_waveform         → requires: project_id, file_id. File must have an audio stream.
get_audio_segment    → requires: project_id, file_id, start, end. end - start must not
                        exceed 300 seconds. File must have an audio stream.
detect_silence       → requires: project_id, file_id. Optional noise_db (default -30),
                        min_duration (default 0.5).

add_audio            → requires: project_id, file_id (video clip), audio_file_id (AUDIO type)
remove_audio         → requires: project_id, file_id of clip in track. Optional track_index
                        (see get_media_info, 01_upload_and_setup.md) removes one specific
                        audio stream instead of all.
adjust_audio_volume  → requires: project_id, file_id of clip in track
extract_audio_track  → requires: project_id, file_id of clip in track. Optional track_index
                        selects which audio stream to save; does NOT modify the source clip.
```

`add_audio`, `remove_audio`, `adjust_audio_volume`, `extract_audio_track` are **async** —
poll `get_job_status` until `COMPLETED`. The three inspection tools at the top are
synchronous.

## Gotcha: audio layering (replace vs. layer)

**`add_audio` layers the new track on top of whatever audio the clip already has — it
does not replace it.** If you want the new audio to *replace* the clip's existing track
entirely (e.g. swapping in a clean voiceover over a clip that has ambient room noise),
call `remove_audio` on the clip **first**, then `add_audio`. Skipping the `remove_audio`
step is the single easiest way to end up with two audio tracks playing at once and not
know why the result sounds wrong — this isn't documented anywhere in the tool schemas
themselves, only here.

```
Want to REPLACE audio entirely:
1. remove_audio  → job_id → poll until COMPLETED
2. add_audio     → job_id (new audio_file_id) → poll until COMPLETED

Want to LAYER new audio over the existing track:
1. add_audio     → job_id (new audio_file_id) → poll until COMPLETED
   (skip remove_audio)
```

## Inspect and remove/extract a specific audio track

```
1. get_track             → get current clip list, note file_id
2. get_media_info        → list audio_streams for that file_id (01_upload_and_setup.md),
                            note the type-relative index of the track to target
3. remove_audio (with track_index) OR extract_audio_track (with track_index) → job_id
4. get_job_status (poll) → wait for COMPLETED
```
Always call `get_media_info` first when targeting a specific track — never guess an
index. A `track_index` beyond the actual audio stream count returns `400` immediately,
not a queued job that fails later.

## Gotcha: supersede + replace applies here too

`add_audio`/`remove_audio`/`adjust_audio_volume` all supersede the source file and create
a new one, exactly like every tool in [`02_assemble.md`](./02_assemble.md) and
[`03_look_and_color.md`](./03_look_and_color.md) — see that section for the full
explanation. `extract_audio_track` is the one exception: it does **not** modify or
supersede the source clip, it only creates a new standalone AUDIO file alongside it.
