# AID site — design notes

Working notes for the AID static site. Read these before changing layout, footer, or logo usage.

## Footer — approved, do not redesign without asking

The footer is the closing signature of every page. Its anatomy (`.foot` in `assets/site.css`):

1. **Giant word** (`.foot .big`) — "AID" in Anton at up to 40rem, flush left, cropped by the
   viewport edge (`overflow:hidden` on `.foot`, negative letter-spacing). The word is bigger
   than the screen on purpose: the brand does not fit in a box.
2. **Rule + row** — 1px rule, then a single row: footer links left, "Build partner: EVRABO"
   right. Small, uppercase, wide letter-spacing, dim until hover (red on hover).

Why it works: one giant statement, one quiet utility row. Nothing else. No newsletter, no
social icons row, no sitemap dump, **no logo** — the giant word is the signature.

## Copy rules (the words we never use)

- **Never write "B2B"** or anything that pitches the studio to clients.
- **Never write "community"** (or "join us", "be part of", "follow us" as a headline). It reads
  like begging for followers. Show what the person came for first (posters, Abrasive films,
  the athletes), then offer ways in as quiet actions: Watch, Follow, Next drop first.
- The fan content is called **Abrasive** (not in the menu), the store is **Shop**, the business side
  is **Studio**. Only Shop and Studio (plus Cart) are in the main nav.

## Who it is for

AID is primarily for athletes, risk-takers, outdoor and adrenaline people who arrive from
social media and may buy posters. The design studio is the second door: professionals find
**Studio** on their own, so the homepage does not sell to them.

## Navigation

Main nav: **Shop · Studio · Cart**. Abrasive is reached from the homepage, the footer and Instagram, not the menu. Studio is ONE page (`design.html`): hero "Be unmistakable", who it is for, "Safe is invisible", a lit floor of concept products (cap, kicks, pack, tee as SVG mockups, swap for real renders later) and a big email link (`#contact`). Work, Build, Contact and the project pages were removed (still in git history). Do not add more top-level items or Studio sub-pages.

## Studio page - current direction (supersedes every earlier Studio take)

Studio presents AID as a design studio. It SHOWS design; no audience labels, no product selling, no lists, no
menus. The owner's word "navigation" means **scroll-driven animation / scrollytelling**: how the page behaves
as you scroll, NOT links or menus. One section with a trick is not enough: the WHOLE page must be one scroll
story.

**One continuous shot** (`.as-story`, 900vh, one pinned 100svh stage, all driven by one progress value in
site.js "studio: one continuous shot"):
1. Hero photo + "Be unmistakable." with **three small "AID" marks at the bottom right (two side by side higher up on the right, the third directly under the right one, requested by the owner)**: camera pushes into the clouds; BE and UNMISTAKABLE tear apart to opposite corners,
   and the whole hero **falls into black**.
2. Out of the black, the film opens as a **rectangle window** (small centered rectangle with rounded corners growing
   to full-bleed). **Never a circle/iris: the owner called it a cheap CapCut effect.** "World on reach." rises over it.
3. Line falls away and **real mist rolls in**: a live WebGL shader (fractal-noise fog, drifting) covers the film in
   swirling cloud. No second image is used for the transition: **never reuse the hero photo or any image just to
   transition (the cloud-photo version was rejected: "why would an image appear double just for the transition").**
**The headline for this beat is "On purpose." The owner rejected "We design." as childish, "a children's book". Keep headlines short, hard, with attitude; never plain descriptions of what we do.**
4. The mist **burns off unevenly, like fog lifting off a mountain** (noise-threshold reveal, no left/right split:
   **"opening doors" / parting halves were rejected as lame**), revealing **the 3D helmet** (live three.js scene in
   `assets/helmet.js`, model `assets/helmet/helmet.glb`, rendered into the same WebGL mist shader as its "poster").
   It simply appears finished out of the mist (no paint reveal). Giant Anton "On purpose." slams up. No "Safe is invisible." line anywhere in the story (owner removed it).
   The old volcano poster is only the fallback if three.js cannot load. **Three.js modules need http(s), not file://: to see the helmet, double-click `start-site.bat` (serves the site at http://localhost:8000/design.html). Opening design.html straight from the folder shows only the poster fallback.**
   **HELMET (current): third-party F1 helmet SHAPE, AID's own livery.** `assets/helmet.js` removes every sponsor layer and the 110
   lettering pieces (Red Bull / Jumbo / Citrix / Mobil 1 / Puma / Arai) and rebuilds the look on the model's clean base shell
   (original material `mat_0`; `mat_2` carries the logos as cut-outs and is hidden). **COLOURS: BLACK AND WHITE ONLY (owner request; no
   red).** Black glossy shell with a **white halftone dot pattern wrapped around it** (tiny dots at the crown growing to large dots at
   the chin, like a printed poster; procedural in the shell shader, no textures), round perforations (top, rear, chin; vents are
   dots, never slits), black visor with ONE big, wide white **AID printed across it** (mapped around the visor's curve; AID appears
   only once on the helmet). **The pattern must never be lines** (owner rejected the weave, vent slits, seam and stripe: "other than a
   fucking line"). **No clay-to-paint / white-to-colour reveal: the owner said it is not needed if the helmet looks good.**
   Rejected looks: glossy all-black with no pattern (read as "a 0-style astronaut"), a smooth untextured shell, anything red.
   **LIGHTING RULE: exactly ONE light source, one white light** (a single white directional light with a cast shadow, plus an
   environment that contains one single softbox in the same direction for the reflection). No rim lights, no coloured lights, no
   hemisphere/ambient fill. Dark scene, form read by that single light and its shadow.
   **PERFORMANCE RULE: quality over quantity of effects. The page was laggy, so: 1024 shadow map, 4-tap glow, the fog noise is skipped
   entirely when there is no fog (early-outs on the mist progress), there is no second clay copy of the helmet any more, the canvas is capped at ~2M pixels, and the helmet is redrawn ONLY when something changes (scroll, drag, inertia,
   mist), not every frame. Do not add effects without removing others.**
   **The helmet turns by DRAGGING (pointer drag with inertia, starts facing the viewer), never by scrolling: scroll only drives the story
   (the mist). Drag is enabled once the helmet is on screen (class `live`); touch-action is pan-y so vertical page
   scroll still works.** Normals on this model face inward (shaders negate them). Composite shader keeps a light glow, vignette,
   contrast curve and film grain.
   **The underlying shape is still someone else's model of unknown licence: placeholder until the owner has an original helmet.**
   **Outdoor effects only (cloud, fog, smoke, snow, embers); pixelation, circles and doors are all rejected.**
   Fallback: if WebGL is unavailable or blocked (e.g. the page opened straight from disk via file://, where images
   are cross-origin for WebGL) the story falls back to a plain crossfade to the poster; test the shader over
   http://localhost, not file://.
   **The story wants plenty of black: black beats between beats, not hard cuts.**
5. Then the "Say hello." form (separate section): giant Anton fields, inverts to white on focus, Send posts via
   Web3Forms (public access key `W3F_KEY` in site.js; FormSubmit was dropped, it returned 522). Visible text spells
   the address without an @ ("To correo_AID at outlook.com"); no "@" in that section.

Rules: words always Anton, white; images natural colour; almost no copy; no counters or floating meters; no
drawn/SVG products (none exist; poster work is the proof); no sliding/stacking cards, grids, buy language, callouts,
lamp or scan-line effects; handoffs between beats are the point, never hard section breaks in the story.
The video is loaded by the story script (the generic lazy loader never sees it inside a zero-size clip-path).
Reduced motion: story collapses to hero + text (class `rm`), no scrub.

## Homepage order (current, supersedes the story below where they conflict)

Hero (Shop the posters / Watch Abrasive) -> The posters (3D stage) -> Abrasive -> poster
sequence -> a short Studio band. The old "What we design" list, selected work and Brand+Build
blocks live on the Studio pages, not the homepage.

## Homepage story

Reference: [Analogue](https://madebyanalogue.co.uk) — the work is the argument. No pitching.
**Never write "B2B", "design studio / B2B", or sales copy.** No statements about what the
client gets. Attitude lines are fine; pitches are not.

The page expresses, in order:

1. **The athlete** — full-bleed video with the big AID over it: a slow red-hot gradient
   sweep through the letters (never glitch). No poster image over the video — the footage
   stays clean. Small meta block bottom-left, and the **triangle gate** bottom-right: a
   white blast grows from the button and opens `film.html`, where the film plays with
   sound, full screen.
2. **What we design** — the hard-ruled list, full width. No artwork previews: the angels and
   poster art are decorative backgrounds, they do not explain the disciplines.
3. **The product** — posters presented like product: 3D pointer tilt, red glow, shine sweep,
   thumbnail switcher, hollow "POSTERS" wall behind. Athlete imagery, in color.
4. **The sequence** — scroll-driven editorial posters as full-screen backgrounds with one
   word each. This is where the decorative art lives.
5. **Selected work → Brand + Build → footer.**

## The film page (`film.html`)

Reached only through the triangle gate. The hero video plays **with sound** (big play
triangle, tap video to pause). Below it, word rooms — who this is for: move first, not for
pussies, be great, show it. Closes on "Made to be remembered." with the work/contact
buttons.

## Logo usage

- Real mark: `assets/Aid_logo.png` — white four-point star, transparent background (RGBA).
  This is the only logo file to use on the site.
- `assets/AID_.png` is a 3092×3072 flat black square — print/master file, **not** for web.
- Favicons live in `assets/`: `favicon.png` (64×64) and `favicon-32x32.png` (32×32),
  both linked with `sizes` on every page. The star on near-black.
- The star mark appears **nowhere on the site** — not the nav, not the footer. The brand is
  type: giant AID, the wordmark in the nav as plain text. The mark lives only in the favicon
  files and as a print/master asset (`assets/Aid_logo.png`).
- **Not in the footer.** Do not re-introduce it there.
- Do not re-introduce the old inline-SVG triangle. The star is the mark; the red accent lives
  in kickers, numbers and hover states, not in the logo.

## Effects rules

- **No glitch on letters.** Glitch text is cheap; type carries itself. (Old `.glitch`
  machinery is legacy — do not reuse.)
- **No marquee.** Motion lives in the sequence and the product stage.
- **Colour is default.** No grayscale filters on work or posters; grade with
  `saturate/contrast` only. Images sell the athlete energy.
- 3D only where it means something: the product tilt. Slow float on touch devices.
- Slow and heavy elsewhere: 1s cubic-bezier(.2,.7,.2,1) reveals, 40–48s rotations.
- Videos: `preload="none"`, `data-src`, play only while on screen.
- Custom cursor: fine pointers only, `prefers-reduced-motion` respected, hidden on touch.

## Space rules (from the EVRABO/XECOR study)

- Every major section is a room: statement 92svh, Brand+Build 100svh, design-page discipline
  panels 82svh each. Content is vertically centered in its room.
- Section padding: `clamp(6rem,12vw,12rem)`. Section headers sit 2.5–4rem above content.
- Big type is sized in `clamp()` with viewport units — wall-to-wall words, never boxed.
- 1px rules separate rooms; the ruled list has a heavy 3px top rule (EVRABO "what we build").
- Red (`#ff1e1e`) is scarce: kickers, numbers, arrows, hover fills, glitch flashes.

## Motion rules

- Slow and heavy: 1s cubic-bezier(.2,.7,.2,1) reveals, 40–48s rotations.
- The homepage poster series (`.seq`) is scroll-driven: a pinned 100svh stage where the posters slide sideways, uncropped, with a caption under each, a progress line and a 01/04 counter, ending on a "Shop all" tile. Reduced motion gets a plain horizontal scroll.
- Videos: `preload="none"`, `data-src`, play only while on screen.
- Custom cursor: fine pointers only, `prefers-reduced-motion` respected, hidden on touch.

## Drop list (waitlist) storage

- No separate database. The "Join the next drop" form becomes a Shopify customer form and the
  emails are saved in Shopify Customers, tagged `drop-list`, with marketing consent.
- Filter by that tag in Admin > Customers to export or email the list (Shopify Email, Klaviyo).
- The static prototype only validates the email; nothing is stored until the theme conversion.

## Abrasive (lab.html) - white theme, video + scrollytelling

White page (`body.lab` overrides the colour vars in `assets/lab.css`). Four scroll stories driven by `assets/lab.js`
(only active when motion is allowed; otherwise static sections): (1) ABRASIVE with the video inside the letters
(white mask, `mix-blend-mode:screen`), letters flip upright from upside-down in a wave, then we zoom into the S until
the video is full-bleed; (2) TESTED / IN PUBLIC. / NO FILLER. flip over a video window that grows to full-bleed
(difference blend); (3) sideways reel, cards and big words tilt in 3D; (4) "Get abrasive." letters flip in.
**The current videos (`hero.mp4`) show third-party NBA footage (logos, sponsors): replace with AID/Abrasive's own clips before publishing.**

## Page transition (global) - `site.js` "page transition engine" + `.pt-*` in `site.css`

Black AID curtain between pages. Built to survive fast clicking and to port to Shopify unchanged (plain JS/CSS, no framework):
- **Inline head script** on every page sets `html.pt-in` when the previous page flagged a transition (sessionStorage `aidpt`), so the new page paints black from the very first frame. Keep that one-liner in the theme's `<head>` (layout/theme.liquid).
- **Prefetch**: links are prefetched on hover/touch/focus, and nav/footer links when idle. On click the page is also fetched in parallel; we leave only when the curtain is closed AND the page is cached.
- **One real curtain element** (Web Animations API): a click mid-lift reverses it from where it is; the last link clicked wins.
- The new page lifts the curtain after load + fonts + two frames, then the first screen rises in (`ptRise`). Studio and Abrasive skip the rise (own scroll stories).
- Skipped: external links, `target`, `download`, `data-pt-ignore`, modifier keys, `/checkout*`, `/account*`, `/cart/add|change|update|clear`. Reduced motion: no transition at all.

## Fonts and Cart

- **Fonts are self-hosted** in `assets/Fonts/` (Anton + Space Grotesk latin woff2), declared at the top of `site.css` and `<link rel="preload">`ed in every `<head>`; Google Fonts links were removed. Shopify: upload the woff2 files to theme assets and point the `@font-face` urls at `{{ 'Anton-latin.woff2' | asset_url }}`. (Zen Kaku was dropped: nothing used `.jp`.)
- **Page intros wait for the curtain**: while `html.pt-in` (curtain down) every CSS animation on the page is paused, so a page's own entrance (home hero etc.) plays in view when the curtain lifts instead of finishing unseen.
- **Cart (`cart.html`, `assets/cart.css`, `assets/cart.js`)**: no giant headline (the footer AID is the only big white word on this page). Split layout: pinned left panel with looping video, a strip of every poster in the cart (click to jump to it, qty badge), totals and Checkout; right, the posters as large cards that tilt in on scroll. Mobile: totals + Checkout ride as a fixed bottom bar. Empty state is a compact video panel. Keep ids `#cart #sub #total #empty` and `.line[data-price] .tot input .rm` (site.js does the maths).

## Performance rules for the scroll stories (Studio + Abrasive)

Measured by scrolling through each stage in headless Chrome at 2x DPR and logging frame times. What was costing frames, in order:
1. **Animated grain** (`.noise`): a full-screen layer ticking every frame. Studio and Abrasive now use a still grain.
2. **`mix-blend-mode` on fixed layers** (nav, cursor): forces the whole scene through an extra surface every frame. On Abrasive the nav/cursor tone is set from `lab.js` (`--navc`) instead of blending. Do not add blend modes to fixed UI on these pages.
3. **`clip-path` animation** (Studio film window): replaced by a scaled, rounded wrapper with a counter-scaled inner (`.st-film` > `.st-in`), same look, no repaint.
4. **Big blend layers** (Abrasive words): the three `difference` words are now only as tall as the text, and hidden when inactive.
5. **WebGL (Studio mist)**: video frames are uploaded only when a new frame exists, the helmet is not rendered before the mist starts, the video is not uploaded/decoded once the helmet fully replaces it. Faded layers get `visibility:hidden`.
- **Studio opening beat** ("Be unmistakable") is time-warped: the first 30% of the animation plays in the first 16.5% of the scroll (story height 820vh).
- Transition progress bar is white.

## Smoothness pass 2 (transitions + stories)

- **Heavy page set-up never runs while the curtain moves.** `window.aidAfterLift(fn)` (site.js) queues work until the lift has finished (or ~300ms after load when there is no curtain). Studio's WebGL mist set-up and `helmet.js` (renderer, glb parse, line-art build in one-mesh slices, shader compile) now start through it. Measured: entrance freezes of 800-900ms on Studio during the lift are gone.
- **Critical videos block the lift until their first frame** (`data-pt-wait` on the Abrasive hero and home hero video), so their first expensive composite happens under the still curtain.
- **Scroll progress is eased** (about 110ms time constant, once per frame) in Studio and Abrasive: a wheel notch no longer jumps the scene, which is what read as "not smooth".
- **Abrasive zoom into the S is drawn on a canvas** (`.lb-hole`: a white sheet with letter-shaped holes, vector text on the GPU, no blend mode) from the moment the letters are upright; the flip phase stays DOM. If you change the heading font/size, `geometry()` in `lab.js` re-measures it.
- Abrasive's growing video window uses transforms (like Studio's film window); reel reads all rects before writing.

## Product (`product.html`, `assets/product.css`, `assets/product.js`)

The owner's brief: people want to buy the design poster, so **the poster first, then Add to cart, as little text as possible, no size-explaining gimmicks** (a version with a 175 cm person and A1/A2/A3 was rejected). Sizes are **20 x 30, 30 x 40 and 50 x 70 cm** everywhere (product, shop pick of the week, cart). Prices are placeholders (38 / 58 / 84): confirm.
- **Story** (420svh, one pinned stage over the looping video): the poster flips upright on arrival (after the page transition), then three one-word beats: *Look.* (poster turns slightly) > *Closer.* (zoom into the print, aimed by `data-fx/data-fy` on the image) > *Yours.* (it settles, Add to cart pulses). Scrolling never swaps the poster. The dock (size chips, quantity, price, Add to cart = the real `form#atc`) never leaves the screen.
- Under it, one line of facts, then **the corridor** (560svh): the other posters hang on two walls in 3D depth and scrolling walks you down the gallery; the nearest poster's name/price is a link at the bottom; "All posters" appears at the end.
- Keep ids `#pdpmain #price #atc #atc-btn #atc-note`, `input[name=size][data-price]`, `input[name=qty]` (site.js owns price/qty/add to cart). Reduced motion: nothing pinned, corridor becomes a simple row. Rules: transforms only, no blend modes/filters/clip-path animation, eased progress (80ms), batched reads.

## Performance tooling

`PERFORMANCE_PLAN.md` has the glossary, ranked suspects, phases and budgets. `?perf` shows a live HUD with a "copy report" button; `?lite` / `?lite=0` force lite mode, which also turns itself on after two slow scrolling windows (remembered in localStorage `aidlite`). Studio fog is drawn at 75% (55% lite) while it moves. Machine used for testing: AMD Radeon 880M (integrated).

## Rule learned from the owner's perf reports (Radeon 880M, 240 Hz)

**Never animate a transform on a playing video or on any ancestor of it per frame** (scale/translate driven by scroll). Measured on the Abrasive zoom: with the hero video's scale animated, p95 frame time 12.6 ms and spikes to 66 ms; with it static, 4.3 ms. (The old 1.18 to 1 settle of the hero video was removed.) Studio's film window is fine because its video's net on-screen scale is identity. Also: the Abrasive zoom canvas runs at CSS-pixel resolution, only draws letters that touch the screen and only takes over once the zoom is under way (scale 1.3); Studio redraws the helmet on scroll only while the fog is moving.

## Shop (`shop.html`, `assets/shop.css`, `assets/shop.js`)

White page, lots of air, one idea per screen (modelled on Abrasive, deliberately not saturated). 1) **Pick of the week** (320svh): the poster hangs alone and flips in as the curtain lifts, headline "This week.", then slides aside while the buy panel (sizes 20x30 / 30x40 / 50x70, price, Add to cart = `[data-wk-buy]`, handled by site.js via `[data-wk]`) comes in. 2) **The wall** (900svh): a sideways track of all nine posters, chaptered by collection with hollow outline words (Adrenaline. / Angelistic. / Singles.); posters hang at alternating heights, tilt in 3D as they pass the centre; the collection names at the bottom are the chapter nav (they replace the old filter/sort bar); sold out = faded, "New" = small tag. 3) **Drop list**: heading flips in, `#joinf` form unchanged. The "Brand walls / talk to us" block was removed (store pages do not pitch clients).
- **`window.aidOnLift(fn)`** (site.js): runs fn when the page-transition curtain STARTS lifting (or just after load with no curtain), so entrances play as the curtain opens. `aidAfterLift` stays for heavy set-up. Product and Shop use `aidOnLift` for the poster flip; the generic first-screen rise (`ptRise`) now excludes `.prod` and `.shop` (it was layering extra fades on top of the product's own entrance).
- Product leftovers removed: the slight turn in "Look", the Add to cart pulse and the poster glow. Product now only has: flip-in, zoom ("Closer"), one-word beats, the corridor.

## Shop wall and product story, revision (Nov 2026)

- **Archived: "Gallery Walk" (tag `gallery-walk-v1`, copies in `work/archive/shop.gallery-walk-v1.*`)**: the previous Shop wall, a sideways track of all posters with hollow collection words and tilting cards. Restore with `git checkout gallery-walk-v1 -- shop.html assets/shop.css assets/shop.js`. It was dropped because Abrasive already uses a sideways reel.
- **Shop wall now = a deck** (760svh pinned): posters stacked in the centre; the top one is tossed up and folded away in 3D, the next rises; the hollow collection word flips when the chapter changes; caption (name, price, View poster) + counter; chapter buttons jump. Transforms and opacity only.
- **Product**: the poster never changes size or moves (the zoom, settle and scale-in were removed); "Closer" now brightens the footage behind it. The "Fill the wall" corridor was removed and replaced by a close: "Hang it." (letters flip in on arrival) + Back to the poster / All posters.

### Revision 2 (same day)
- The deck (poster stack) was rejected too. **Shop wall now: every poster gets its own screen**, big (80svh), flips in, holds, leaves, alternating sides with name/price/View poster on the opposite side (centred on phones). 1000svh. Decks and stacks are rejected; Gallery Walk stays archived as `gallery-walk-v1`.
- **Product** was too busy: the dock with quantity stepper, header lines and noise overlay are gone. Now a calm right-hand panel (name, edition, sizes, price, Add to cart; quantity is a hidden input = 1), footage behind kept. After the story: **four more posters, each on its own white screen** (flip in on arrival), then "Hang it." on white, then the footer.
- **Studio on phones** (`site.css`, max-width 700px): "Be unmistak-able." is 36vw, lifted off the bottom; "World on reach." is 27vw wrapping on three lines inside the margins.

## Home (`index.html`, `assets/home.css`, `assets/home.js`) - third take, Nov 2026

The owner wants **a statement, rough and punchy: one quality of AID, one film, no piles of images/videos, no repeated effects, no letter flips.** Earlier takes (flip stages, claimed lines, 3D fly-through) were rejected; see git history.
- **One pinned statement (520svh):** the hero film with AID bleeding off the bottom-left corner > hard cut **NOT** (white, film nearly black) > hard cut **SAFE.** (black on a full red slab) > hard cut **ON PURPOSE.** (film back). Every cut slams, flashes white and shakes the stage; inside a beat the word slowly pushes in with the scroll (a transform on the word only, never on the film).
- **Doors:** three hard-ruled rows (Posters, Abrasive, Studio); hover inverts. No images.
- **Software developer partner:** hollow EVRABO link with "AID designs it. EVRABO builds it." The footer line now reads "Software developer partner: EVRABO" on every page.
- Hero film is third-party NBA footage: replace before publishing.

## Studio, Add spice
The helmet scene's background is now `assets/snow_hor.jpg` (cover-fitted, set in `helmet.js`), under the fog shader.
