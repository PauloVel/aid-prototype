# AID: smoothness plan

## Words to use (so we mean the same thing)

| Term | What it is |
|---|---|
| **Page transition** (nickname: *the curtain*) | The black AID panel between pages. Three phases: **close** (the old page is covered), **load** (the curtain holds while the next page arrives), **lift** (the new page is uncovered). |
| **Scroll story** | A pinned screen whose animation is driven by scrolling: Studio, Abrasive, Product. |
| **Pinned stage** | The full-screen `position: sticky` viewport a scroll story plays on. |
| **Eased progress** | Scroll position smoothed per frame (about 110 ms), so a wheel notch does not jump the scene. |
| **Frame budget** | Time per frame: 16.7 ms at 60 Hz, 8.3 ms at 120 Hz. Over budget = a visible stutter. |
| **Lite mode** | A lighter rendering mode (no grain, no blend modes, smaller WebGL, 1x canvas). Automatic or `?lite`. |

## What we know

- Your GPU (read from the HUD on this machine): **AMD Radeon 880M, integrated**. Integrated GPUs share memory with the CPU and are limited by **how many pixels they have to repaint per frame**, not by how clever the code is. A high-resolution laptop screen makes that worse.
- So the rule is: **fewer and smaller full-screen layers per frame.** Everything below follows from it.
- Measured and already fixed (see `notes.md`): animated grain, `mix-blend-mode` on the nav and cursor, `clip-path` animation (Studio square, Abrasive window), heavy set-up running during the page transition lift, un-eased scroll progress, layout reads mixed with writes, CSS filters on videos.

## Suspects still on the list (ranked by likely cost on an integrated GPU)

1. **Studio mist** (`p .66 to .92`): one full-screen shader doing three layers of noise per pixel, plus the helmet drawn in a second WebGL canvas and copied into it every frame, plus a video frame upload. *Mitigation shipped:* the fog is now drawn at 75 % size (55 % in lite) while it moves, full size once it clears.
2. **Videos**: `hero.mp4` is 4.5 MB (and shows third-party footage), `outdoor_video.mp4` 1.3 MB. Big, high-resolution video decoding plus compositing is the single most expensive thing on the page. *Needs:* re-encode to 720p, about 1.5 MB each, short keyframe interval, no audio track (commands below; ffmpeg is not installed on this machine).
3. **Studio first beat**: a 2200 px photo scaled up to 2.6x with a full-screen gradient over it. *Option:* a 1600 px WebP, smaller overdraw.
4. **Abrasive zoom into the S**: now drawn on a canvas (vector, no blend). Remaining cost is the full-screen canvas itself; lite mode uses 1x.
5. **Page transition**: the curtain itself is cheap (a compositor transform). What hurts is the *next page loading underneath*. See Phase 4.
6. **Product / Cart**: pinned video backdrops are cheap now (no filters), but they are still full-screen video.

## Phases

**Phase 0, done:** measure in headless Chrome, fix the biggest offenders (list above).

**Phase 1, done in this commit:**
- `?perf` HUD on any page: live fps, p95 frame time, worst frames while scrolling, GPU name, screen size, long tasks, and a **copy report** button.
- **Lite mode**: `?lite` forces it, `?lite=0` clears it, and it **switches itself on** (and is remembered) when two scrolling windows in a row are slow on that machine.
- Studio fog rendered smaller while it moves.

**Phase 2, needs you (10 minutes):** open `design.html?perf`, `lab.html?perf`, `product.html?perf`, scroll through each slowly, press **copy report** at the slowest moment and paste the three reports to me. That tells me which stage is over budget on your real hardware, not mine.

**Phase 3, assets (biggest single win, needs ffmpeg):**
```
ffmpeg -i hero.mp4          -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow -g 30 -an -movflags +faststart hero.mp4.new
ffmpeg -i outdoor_video.mp4 -vf scale=-2:720 -c:v libx264 -crf 28 -preset slow -g 30 -an -movflags +faststart outdoor_video.mp4.new
```
Also: swap `hero.mp4` for AID's own footage (rights), convert `BK_passage.jpg` to a 1600 px WebP.

**Phase 4, page transition upgrade:**
- Chrome **Speculation Rules**: pre-render light pages (Shop, Product, Cart, Home) while you hover, so the *load* phase is near zero; keep Studio and Abrasive on prefetch only (their WebGL must not start in the background).
- Optional: the browser's **cross-document View Transitions** as the curtain in Chrome, with the current curtain as the fallback.

**Phase 5, Studio-specific:** half-resolution helmet buffer while the fog covers it, drop the second gradient layer, cap the hero image decode size.

**Phase 6, guard rails:** a short QA checklist run before each push (HUD on each story page; no frame over 50 ms after the lift).

## Budgets (what "smooth" means here)

- Scrolling frames: p95 under 16.7 ms at 60 Hz on the Radeon 880M at native resolution (under 8.3 ms if the screen is 120 Hz).
- No long task over 50 ms after the lift finishes.
- Each page: under 3 MB before the first scroll (videos are loaded lazily and not counted), each video 1.5 MB or less at 720p.
