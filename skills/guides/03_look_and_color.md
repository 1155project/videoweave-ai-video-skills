---
name: "Guide: Look & Color"
description: |
  Task guide for every video-only visual effect — color correction, geometric
  transforms, quality/restoration, stylistic looks, motion/animation, chroma
  key, frame rate, plus overlays (logo/text) and scene-change detection.
type: guide
---

# Guide: Look & Color

## When to Use This Guide

- Adjusting color/exposure (brightness, contrast, saturation, gamma, white balance)
- Geometric changes (crop, rotate, flip)
- Quality fixes (sharpen, blur, denoise, deblock, or the combined `enhance_video`)
- Stylistic/creative looks (vignette, sepia, grayscale, pixelate, emboss, edge detection)
- Animated motion (zoom, pan, Ken Burns), chroma key compositing, frame rate conversion
- Overlays: logo/watermark, text
- Deciding *where* a visual change is needed — `detect_scene_changes` flags likely cut
  points; use [`02_assemble.md`](./02_assemble.md)'s `get_media_frame`/`get_contact_sheet`
  to actually look at the footage first

**Every tool in this guide is video-only — audio is always left untouched** (the one
partial exception, `add_text`/`add_logo`, are overlays composited onto the video stream;
they don't touch audio either).

## Tools in This Guide

| Skill File | Tool Name | What It Does |
|---|---|---|
| `64_detect_scene_changes.md` | `detect_scene_changes` | Detect timestamps where the visual content changes significantly |
| `33_adjust_brightness.md` | `adjust_brightness` | Adjust a clip's brightness |
| `34_adjust_contrast.md` | `adjust_contrast` | Adjust a clip's contrast |
| `35_adjust_saturation.md` | `adjust_saturation` | Adjust a clip's color saturation (0.0 = fully grayscale) |
| `36_adjust_gamma.md` | `adjust_gamma` | Adjust a clip's gamma (midtone brightness) |
| `37_adjust_white_balance.md` | `adjust_white_balance` | Adjust color balance via per-channel gamma |
| `38_crop_video.md` | `crop_video` | Crop a clip to a pixel rectangle |
| `39_rotate_video.md` | `rotate_video` | Rotate a clip by 90/180/270 degrees |
| `40_flip_video.md` | `flip_video` | Mirror a clip horizontally or vertically |
| `41_sharpen_video.md` | `sharpen_video` | Sharpen a clip |
| `42_blur_video.md` | `blur_video` | Blur a clip |
| `43_denoise_video.md` | `denoise_video` | Reduce noise/grain in a clip |
| `44_deblock_video.md` | `deblock_video` | Reduce compression blockiness (no tunable parameter) |
| `45_enhance_video.md` | `enhance_video` | One combined color + sharpness + noise-reduction pass |
| `46_apply_vignette.md` | `apply_vignette` | Darkened-edges vignette effect |
| `47_apply_sepia.md` | `apply_sepia` | Sepia tone (no tunable parameter) |
| `48_apply_grayscale.md` | `apply_grayscale` | Grayscale (equivalent to `adjust_saturation(0)`; exists for discoverability) |
| `49_pixelate_video.md` | `pixelate_video` | Pixelation/mosaic effect |
| `50_apply_emboss.md` | `apply_emboss` | Emboss/relief effect (no tunable parameter) |
| `51_detect_edges.md` | `detect_edges` | Edge-detection outline effect (no tunable parameter) |
| `52_zoom_video.md` | `zoom_video` | Animate a zoom across the whole clip |
| `53_pan_video.md` | `pan_video` | Pan across the frame at a fixed zoom, across the whole clip |
| `54_ken_burns_video.md` | `ken_burns_video` | Animated zoom-and-pan (Ken Burns), across the whole clip |
| `55_apply_chroma_key.md` | `apply_chroma_key` | Composite a green/blue-screen clip onto a still background image |
| `56_convert_frame_rate.md` | `convert_frame_rate` | Convert a clip to a target frame rate |
| `20_add_logo.md` | `add_logo` | Overlay a logo/watermark on a clip |
| `21_add_text.md` | `add_text` | Add a styled text overlay to a clip |

## Sequencing Rules

```
detect_scene_changes → requires: project_id, file_id. Optional threshold (0.0-1.0, default 0.4).

adjust_brightness    → requires: project_id, file_id of clip in track. Video only.
adjust_contrast      → requires: project_id, file_id of clip in track. Video only.
adjust_saturation    → requires: project_id, file_id of clip in track. Video only.
                        saturation=0.0 produces a fully grayscale output.
adjust_gamma         → requires: project_id, file_id of clip in track. Video only.
adjust_white_balance → requires: project_id, file_id of clip in track. Video only.
                        Set red/green/blue independently; each defaults to 1.0 (no-op).
crop_video           → requires: project_id, file_id of clip in track, x, y, width, height.
                        Call get_media_info (01_upload_and_setup.md) first for actual pixel
                        dimensions — an out-of-bounds rectangle is rejected (400) when known.
rotate_video         → requires: project_id, file_id of clip in track, degrees (90/180/270).
                        90/270 swap width and height.
flip_video           → requires: project_id, file_id of clip in track, direction
                        ("horizontal" or "vertical").
sharpen_video        → requires: project_id, file_id of clip in track. Optional amount
                        (0.0-5.0, default 0.0 no-op).
blur_video           → requires: project_id, file_id of clip in track. Optional amount
                        (0.0-20.0, default 0.0 no-op).
denoise_video        → requires: project_id, file_id of clip in track. Optional amount
                        (0.0-3.0, default 0.0 no-op).
deblock_video        → requires: project_id, file_id of clip in track. No tunable parameter.
enhance_video        → requires: project_id, file_id of clip in track. Optional strength
                        (0.0-1.0, default 0.5 — an active improvement, not a no-op).
apply_vignette       → requires: project_id, file_id of clip in track. Optional strength
                        (0.0-1.0, default 0.0 no-op).
apply_sepia          → requires: project_id, file_id of clip in track. No tunable parameter.
apply_grayscale      → requires: project_id, file_id of clip in track. No tunable parameter.
pixelate_video       → requires: project_id, file_id of clip in track. Optional block_size
                        (1-64, default 1 no-op).
apply_emboss         → requires: project_id, file_id of clip in track. No tunable parameter.
detect_edges         → requires: project_id, file_id of clip in track. No tunable parameter.
zoom_video           → requires: project_id, file_id of clip in track, start_zoom, end_zoom.
pan_video            → requires: project_id, file_id of clip in track, direction, distance.
ken_burns_video      → requires: project_id, file_id of clip in track, start_zoom, end_zoom.
apply_chroma_key     → requires: project_id, file_id of clip in track, background_file_id
                        of an image file. Background must be a still image.
convert_frame_rate   → requires: project_id, file_id of clip in track, target_fps
                        (0 < target_fps <= 120).
add_logo             → requires: project_id, file_id (video clip), logo_file_id (LOGO type)
add_text             → requires: project_id, file_id of clip in track
```

All 26 edit tools here (everything except `detect_scene_changes`, which is synchronous)
are **async** — poll `get_job_status` until `COMPLETED`.

## Gotcha: same supersede + replace pattern as Assemble

Every tool here creates a new file and supersedes the source — see
[`02_assemble.md`](./02_assemble.md)'s "Gotcha: the supersede + replace pattern" section;
it applies identically here. Use `get_track` (not `list_files`) to find the current
file_id after any of these operations, or read the completed job's `output_file_id`
directly (see [`05_export.md`](./05_export.md)).

## Inspect before you adjust

Before calling any color/look tool, consider pulling evidence first:
`get_media_frame` (single frame, inline image) or `get_contact_sheet` (grid of samples,
inline image) — both in [`02_assemble.md`](./02_assemble.md) — let you actually see the
footage's current state instead of guessing at parameter values.
