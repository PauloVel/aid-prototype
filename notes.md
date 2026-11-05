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

**One continuous shot** (`.as-story`, 780vh, one pinned 100svh stage, all driven by one progress value in
site.js "studio: one continuous shot"):
1. Hero photo + "Be unmistakable.": camera pushes into the clouds; BE and UNMISTAKABLE tear apart to opposite corners,
   and the whole hero **falls into black**.
2. Out of the black, the film opens as a **rectangle window** (small centered rectangle with rounded corners growing
   to full-bleed). **Never a circle/iris: the owner called it a cheap CapCut effect.** "World on reach." rises over it.
3. Line falls away; the live film frame pixelates into huge raw blocks (canvas), then **dips to black**.
4. Out of the black the approved poster (volcano figure, WHYDG) appears as raw blocks and resolves into focus while
   giant Anton "We design." slams up; "Safe is invisible." appears once sharp.
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
