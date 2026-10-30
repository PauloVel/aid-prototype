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
- The homepage poster sequence (`.seq`) is scroll-driven: sticky 100svh stage, crossfading
  images, one word per slide, 01/04 counter. Reduced motion gets a static image.
- Videos: `preload="none"`, `data-src`, play only while on screen.
- Custom cursor: fine pointers only, `prefers-reduced-motion` respected, hidden on touch.
