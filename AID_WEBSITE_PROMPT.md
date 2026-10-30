# AID website: reset brief and build prompt

Paste everything below the line into Claude Code (or any builder) in a new, empty folder.
Put your logo files and posters in `assets/` first.

---

## PROMPT

Build the website for **AID**, a **B2B design studio**, as a **Shopify theme** (Liquid, `sections/`, `templates/`, `layout/theme.liquid`), in the existing theme folder. Vanilla CSS and JS only, no frameworks. Store: `aid-branding.myshopify.com`. Read `AID.md` in the theme root first for brand lore and keep what still works. The storefront **is and stays on Shopify**: AID sells **posters** (add to cart, checkout, cart all handled by Shopify). Do not rebuild commerce or move it off Shopify.

### Who AID is
- AID is a design studio. It makes **brand identity, interface design, product design, campaign strategy, photography/video/content**.
- Customers are **businesses**, not consumers. Every page must make a company think "these people will make us look dangerous in a good way".
- AID is the design partner of **EVRABO**, a B2B software development company (same founder). AID designs, EVRABO builds. The two refer clients to each other. Link to EVRABO as "Build partner", never as the owner.
- AID is a **design studio first, with a Shopify poster store as its second leg**. The homepage leads with the studio (what we design, for businesses). The **Posters** store is a clear, separate section and nav item ("Shop") that sells posters through Shopify to anyone. It also acts as proof of taste. The Abrasive Shorts content is shown in Work/Lab.
- The store was built by EVRABO on Shopify. Credit it where it's relevant ("Store built by EVRABO"), never as the main message.

### Voice
Risk-takers. Imposing. Committed. Short, direct sentences, no filler, no apologies, no "we are passionate about". Say what we do and what it costs the client not to do it.
Examples of the tone: "Disrupt. Create. Destroy. Rebuild." / "Made to be remembered." / "Your competitors will hate this."

### Visual system (must match EVRABO, as if the same hand designed both)
- Background near-black `#050505`, text `#f0f0f0`, single accent **red** (use sparingly: kickers, dividers, hover).
- Fonts: **Anton** (headlines, uppercase, huge, tight line-height), **Space Grotesk** (body, kickers, wide letter-spacing, uppercase small caps style), **Zen Kaku Gothic New** (light weight, for Japanese/secondary marks).
- Giant type, wall-to-wall words, glitch-text effect on key headings, subtle film-noise overlay, hard 1px rules, hollow outlined shapes, a triangle motif.
- Hard-ruled numbered list with hover preview (as in EVRABO's "What we build"), full-bleed video hero, scroll reveals.
- Motion: slow, heavy, confident. Respect `prefers-reduced-motion`. Lazy-load videos, `preload="none"`, only play videos while on screen.
- Mobile first-class: every section works on a phone.

### Structure (single page + one detail page per project)
1. **Hero**: full-bleed looping video (poster fallback), kicker in red, headline "AID", sub-line "Brand · Interface · Product". Small credit line: "Build partner / EVRABO".
2. **Statement (breathing section)**: short, big, quiet. What AID is for in two lines. Use the AID mark on the right, slowly rotating.
3. **What we design**: numbered hard-ruled list, hover preview image: 01 Identity (name, logo, visual language, tone: the system that makes a brand recognizable), 02 Interface (websites, apps, dashboards: how it looks and feels to use), 03 Product (the object or digital product itself: concept, form, packaging, experience), 04 Campaigns, 05 Content. One line each ("Made to be remembered", etc.).
4. **Work**: grid of project cards (poster, category, name, one-line result, link). Include the posters I already have. Include "Abrasive Shorts" (content) and the online store as lab/proof, labelled "Built by EVRABO" where that's true.
5. **Lab / Abrasive**: the media side: Instagram `@abrasivetmt`, short-form content. Framed as AID's lab.
5b. **Posters (Shop)**: Shopify collection of posters with add-to-cart straight from the page, using Shopify's real products, cart and checkout (`main-collection`, `main-product`, `main-cart`). Styled in the AID system, not default theme styling.
6. **Brand + Build**: one block for the joint offer: "AID designs it. EVRABO builds it. One team, one invoice." Button to EVRABO.
7. **Contact**: one form: name, company, "what do you need? Design / Software / Both", message. Routes "Software" and "Both" to EVRABO's contact. Email link as fallback.
8. **Footer**: AID mark, links, "Build partner: EVRABO".

### Assets I will provide
- `AID_LOGO` (wordmark with star symbol), AID symbol alone, posters, hero video.
- Instagram: `https://www.instagram.com/abrasivetmt`
- Store: `https://aid-branding.myshopify.com/`
- EVRABO site: https://evrabo.com

### Technical rules
- Shopify theme structure: Liquid sections and JSON templates, theme settings in `config/`, assets in `assets/`. Keep it valid for Shopify (`shopify theme check` clean where possible). Products, prices, cart and checkout come from Shopify objects, never hardcoded.
- Per-page `<title>`, meta description, Open Graph tags via `theme.liquid` (Shopify generates sitemap and robots).
- Images in WebP where possible, explicit width/height, `loading="lazy"`.
- Accessible: real headings, alt text, focus states, 4.5:1 contrast on body text.
- No external JS libraries. No tracking.

### Do first
1. Show me the plan and the section copy (in the voice above) before writing code.
2. Build the hero + statement + "What we design" first, then stop for review.
3. Then Work, Lab, Brand+Build, Contact.

### Never
- Never make the homepage a store front: studio first, posters in their own section.
- Never move selling off Shopify.
- Never claim software development; that is EVRABO.
- Never use soft, corporate, or stock-agency language.
