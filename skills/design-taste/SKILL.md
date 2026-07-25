---
name: design-taste
description: Shared design vocabulary, reference-library format, and anti-slop guardrails for web design work — aesthetic families, the four-part design brief, and the rules that keep AI output from converging on the same generic look. Use when generating or refining any web UI, landing page, hero section or visual design, when building a taste/inspiration library, when a design "looks AI-generated", or when running /taste, /variants or /tweakbar.
---

# Design Taste

## Why this exists

AI design output is rarely bad. It is *generic* — and better models do not fix that, they only move where "generic" sits. The fix is not a better model or a more detailed prompt template. It is **specific reference**: naming an aesthetic, showing an example, stating intent, and setting guardrails.

Everything here is a vocabulary and a set of constraints. It is deliberately not a step-by-step script — the shape of a good design process changes with the brief. Use judgement.

---

## The four-part brief

Every design prompt in this module carries four things. If any is missing, the output regresses to the mean. Ask for what's missing rather than guessing.

1. **Aesthetic** — the family the design belongs to. Name it (see families below). Not "modern and clean", which is not a family.
2. **Reference** — one or more concrete examples: an image from the taste library, a screenshot, or a live URL. The goal is to **match the feel, not copy the content or layout**. Never reproduce another site's copy, structure or assets.
3. **Intent** — what is being built and why. What kind of product, who the audience is, and the single action the visitor should take.
4. **Guardrails** — the always-do and never-do list. This is where anti-slop rules live, plus any brand constraints.

A brief with all four is worth more than any amount of prescriptive step-by-step instruction.

---

## Aesthetic families

A starting vocabulary, not a closed set. Invent new families when the reference calls for it — record them in the taste library so they can be reused.

| Family | Character | Typically |
|---|---|---|
| `print-tech` | Editorial/newspaper grid brought to software | Serif or grotesk headings, rules and hairlines, data-as-texture, restrained palette |
| `vast-quiet` | Cinematic, minimal, one monumental image | Huge negative space, small type, a single landscape or object, near-monochrome |
| `dither-mono` | Early-computing, halftone, 1-bit | Dithered imagery, mono type, high contrast, deliberate low fidelity |
| `classical-remix` | Antiquity meets interface | Sculptural imagery, classical serifs, warm stone neutrals |
| `swiss-utility` | Systematic, grid-first, unfussy | Helvetica-lineage type, strict columns, colour used only as signal |
| `warm-craft` | Handmade, tactile, humane | Textured backgrounds, generous curves, warm palette, illustrated detail |
| `technical-dense` | Dashboard/terminal energy, information-rich | Mono numerals, tables, tight spacing, functional colour coding |
| `soft-editorial` | Magazine calm, photography-led | Large photography, elegant serif/sans pairing, muted tones |

When choosing families for a spread, pick ones that are **genuinely far apart**. Five variations of minimalism is not a spread — it is one idea rendered five times, and it wastes the exercise.

---

## The taste library

The library lives at `.taste/` in the project, or `~/.taste/` for a personal cross-project one. Prefer the project one when it exists.

```
.taste/
  library.json          # index of every entry
  images/               # the screenshots themselves
  families/<name>.md    # reusable brief per aesthetic family
```

`library.json` entries carry at minimum: `id`, `file` or `url`, `family`, `keywords`, and a short `notes` line on what specifically is good about it. Anything reading the library should tolerate extra fields and missing optional ones.

Each `families/<name>.md` is a **paste-ready reference brief**: what the family is, its typographic and colour character, what it does with imagery and motion, and what it must never drift into. That file is what `/variants` reads, so it should stand alone without the images.

If no library exists, design work still proceeds — ask for a reference URL or screenshot instead, and offer to start a library from what gets chosen.

---

## Anti-slop guardrails

These are defaults, not laws. Override them when the brief genuinely calls for it — but override deliberately, and say so.

**Never, unless explicitly asked:**
- Purple-to-blue gradients, or any gradient used as the primary visual idea
- Inter, or a system-font stack, as the headline face
- Floating 3D blobs, glassmorphic cards, generic gradient orbs
- Emoji as feature icons
- Three-column feature grids with an icon, a bold noun, and two lines of filler
- "Supercharge", "unleash", "10x", "game-changing", "seamlessly" in UI copy
- Centre-aligned everything with no compositional tension
- A carousel of fake logos, or fabricated testimonials, metrics, or customer names

**Prefer:**
- One decisive typographic voice over three hedged ones
- Real content and real numbers over lorem and placeholder claims — if the real thing isn't known, ask
- Asymmetry, deliberate scale contrast, and space used as a compositional element
- Motion that carries weight and meaning; nothing that animates merely because it can
- Colour earned by the reference, not chosen from the default palette

**Always:**
- Meet WCAG AA contrast on text
- Respect `prefers-reduced-motion`
- Keep the layout working from 360px up; wide elements scroll inside their own container rather than the page
- Style both light and dark when the project supports both

---

## How the commands fit together

`/taste` builds and maintains the library. `/variants` uses it to explore wide and then narrow. `/tweakbar` handles the last mile of adjustment and writes the result back into the codebase.

They are independent — each works without the others — but the sequence is the intended path.

## Working with related tooling

If the project already has a design system (`.layout/`, a Figma library, a tokens file, or a `CLAUDE.md` design section), **that outranks everything here**. Read it first and treat this skill as the process, not the palette.

Optional external tools that complement this module, if the user has them: front-end de-slop skills such as Impeccable or the taste skill for critique passes, the Higgsfield skills for image and video generation, and `dev-browser` for screenshotting work in progress. None is required — never make them a hard dependency or install one uninvited.
