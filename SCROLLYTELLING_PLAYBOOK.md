# Scrollytelling + video page: how to ask for it, and what you get

A reusable brief for turning any plain page into an explosive, video-led scroll experience.
Copy the **Brief template**, fill the blanks, and use the **Recipes** as the menu of what the result can contain.

---

## 1. The kind of request this is

> "Make this page explosive and impactful. The most impactful things on a website are video and
> scrollytelling, so put all the effort into those two. [Theme / typographic direction]."

Signals that this is the right playbook:
- The page is currently a template (header, lead, card grid) and should become an *experience*.
- Video and motion are the point; text is short and loud.
- The owner wants a distinct look per page (e.g. a white theme on one page while the rest is dark).

What it is **not**: a rewrite of copy, a store/checkout change, or adding sections for information.
It replaces "sections you scan" with "beats you scroll through".

---

## 2. Brief template (fill the blanks)

```
Page: <file or URL>
Goal in one line: <what a visitor should feel in the first 5 seconds>
Theme: <white / black / colour>, accent colour: <...>
Type direction: <e.g. giant condensed caps, words that flip in 3D, upside-down arrivals>
Video available: <list files, or "none yet, use placeholders and tell me">
Stills available: <list>
Must keep: <nav, footer, copy rules, words to avoid>
Never do: <effects already rejected, e.g. "no circle iris", "no split-door reveals">
Target: <static site now / later converted to Shopify (or other CMS)>
Motion preferences: <respect reduced motion: yes>
```

The more precise the **Never do** and **Must keep** lines, the fewer rounds of rework.

---

## 3. What the outcome looks like

A page of **3 to 5 pinned scroll stories** followed by one quiet call to action and the normal footer.
Each story is one full-screen stage that stays fixed while the scroll position drives the animation.

| Beat | Idea | Why it hits |
|---|---|---|
| 1. Opener | Giant title with **the video playing inside the letters**; letters flip in 3D (upside down to upright) in a wave; then zoom into one letter until the video fills the screen | The first scroll turns a headline into a film |
| 2. Statement | Two or three short words flip through over a **video window that grows to full-bleed**, words blended against the footage | Copy and footage fight and fuse; no paragraph needed |
| 3. Reel | A pinned **sideways track** of clips and stills; each card tilts in 3D as it passes the centre; giant words sit between cards | Vertical scroll becomes horizontal travel, which feels like a tour |
| 4. Close | Final headline whose letters flip in when it arrives, then 1 or 2 quiet buttons | A clean landing after the noise |

Principles behind it:
1. **One scroll value per stage.** Everything on a stage is a pure function of its progress (0 to 1). No timers, no competing triggers. This is what makes it smooth and reversible.
2. **Video is the material, not a decoration.** It is masked by type, revealed by clip-paths, or filling the screen. It is never just a box on the page.
3. **Short, hard words.** Two to three words per beat, with attitude. Never descriptions of what the company does.
4. **3D through letters, not through gimmicks.** `rotateX` flips with `perspective`, staggered per letter or per word.
5. **Restraint outside the stages.** Plain background, almost no UI, the approved footer unchanged.
6. **Contrast of theme.** A white page with black type makes the footage look more violent; use it deliberately.

---

## 4. Recipes (the techniques, in plain terms)

**Video inside the letters.** Put the video full-bleed. Over it, a white layer with black text and
`mix-blend-mode: screen`: black passes the video through, white stays white. Use pure `#fff` for the
layer, otherwise the video ghosts through the "white". The video's own background should be black so the
page still reads if the video fails to load.

**Flip upright in a wave.** One `<span>` per letter inside an element with `perspective`. Start each at
`rotateX(180deg)` (upside down), end at `0`, and offset each letter's progress window so it ripples.
Keep a no-JS fallback where letters are simply upright.

**Fall into a letter.** Scale the whole word with an exponential curve (`scale = e^(ln(max) * eased progress)`)
using `transform-origin` set to the centre of one specific letter (measure it in JS). When the letter
fills the screen, fade the white layer out so only the video remains.

**Growing video window.** Video in a full-size box clipped with `clip-path: inset(Y X round R)`.
Animate inset to 0. Words on top use `mix-blend-mode: difference` with white text, so they read on both
the white page and the footage.

**Words that arrive upside down.** Alternate the entry: from below (`rotateX -95deg`) or fully flipped
(`rotateX 180deg`), and exit in the opposite direction. Only one word is visible at a time.

**Sideways track.** A tall wrapper (about 6 screens high) with a sticky 100vh child; translate a flex row
by progress. For each card, read its centre relative to the viewport centre and set
`rotateY` and `scale` from that distance, so the centred card faces you and neighbours turn away.

**Letters flip in on arrival.** For the closing headline, an `IntersectionObserver` adds a class; CSS
transitions each letter from `rotateX(180deg)` to none with `transition-delay` from an index variable.

---

## 5. Rules that make it ship-ready

- **Reduced motion:** if the user asks for less motion, skip the script entirely and show the same
  content as static sections. Never leave the page empty.
- **Pinned stages only when JS runs:** add a class to `<html>` from the script; all heights and sticky
  positioning live behind it. Without JS you still get readable sections.
- **Performance:** only update stages that are on screen; use `requestAnimationFrame`; play and pause
  videos with an `IntersectionObserver`; load video lazily.
- **Mobile:** smaller type clamps, smaller cards, a tighter clip-path inset. Test at phone width.
- **Accessibility:** decorative animated type is `aria-hidden`; a visually hidden real `<h1>`/`<h2>`
  carries the text. Keep focus styles. Keep contrast of body text.
- **Nav stays readable on both themes:** use a difference blend on the fixed header.
- **CMS-friendly (e.g. Shopify):** keep each story isolated as one section with its own CSS and JS file,
  no globals, assets referenced by relative path, so it can drop into a theme section.
- **Copy rules and rejected effects are law.** If the project forbids certain words or effects
  (CapCut-style irises, parting doors, "we design" copy), restate them in the brief.

---

## 6. Rights and content checks (do this before publishing)

- Footage and images must be yours or licensed. Placeholder clips with third-party logos
  (sports leagues, sponsors, other brands) must be replaced before going public.
- Fonts: confirm licences for anything not from an open library.
- Music or sound: none by default; add only with licence.

---

## 7. How the work is verified

1. Serve the site over http (module scripts and video need it; `file://` can break them).
2. Scroll through the page at a fixed set of positions (start, each beat's start/middle/end, the end)
   at desktop width, capture screenshots, and look at each one.
3. Check: first frame is not broken (letters upside down is intended, a blank screen is not);
   white areas are truly white; the last frame of each stage leads into the next; the footer and nav
   are intact; the page still works with motion reduced.
4. Repeat at phone width.
5. Commit, and add a short section to the project notes describing the beats and the rights caveats.

---

## 8. Quick prompts you can reuse

- "Turn `<page>` into a scroll story: video inside the title letters, flipping 3D words, a sideways reel,
  and a quiet closing. Theme: `<white|black>`. My clips: `<files>`."
- "Same treatment for `<another page>`, but with `<different theme>` and the story around `<its subject>`."
- "Keep the nav and footer. Don't add sections. Don't use `<rejected effects>`."
- "List what needs replacing before publishing (footage, fonts, copy)."

## 9. Variations

| Page type | Opener | Middle | Close |
|---|---|---|---|
| Product / shop | Product name with footage inside letters | Product flips through over a growing video window | Sideways reel of variants, then buy buttons |
| Portfolio / studio | Studio name zoom into a letter | Project titles flip over each project's reel | Contact line with letters flipping in |
| Event / film | Title card over trailer | Dates and lineup as flipping words | Ticket or watch buttons |
| Brand story | Manifesto word wave | Three claims over a growing video | One action |
