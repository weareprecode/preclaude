---
description: Add a live tweak panel to the dev server — adjust type, colour, spacing and motion visually, then write the result back into the code
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, AskUserQuestion
argument-hint: [page or component to tweak, or "apply" to commit the current tweaks — optional]
---

# Tweak bar: $ARGUMENTS

Design decisions that are hard to describe are easy to make visually. Rather than asking for "more premium" and re-rolling the page, put the decisions on sliders and let the user find the answer by moving them — then write the chosen values back into the codebase.

Read the `design-taste` skill first for the guardrails that still apply.

## Two modes

- **default** — build (or update) the tweak panel for the current page
- **`apply`** — take the values currently set in the panel and commit them into the real source

Infer which from `$ARGUMENTS`. If a panel already exists and they run this again, assume they want it extended or rebuilt for a different page, and ask if it's unclear.

---

## Building the panel

**Find the real knobs first.** Read the page and its styles before writing any UI. The panel should expose the decisions this page actually contains, not a generic list. A page with no motion doesn't need motion controls; a page whose entire character is its type scale needs that scale broken out properly.

Prefer to be **aggressive with what's offered** — more controls than feel necessary. The value is in discovering that a decision existed at all. Typical territory:

- Type: heading and body family, scale ratio, weight, tracking, leading, optical size
- Colour: background, foreground, accent, surface, border, and the strength of each
- Space: section rhythm, container width, grid gap, block padding
- Shape and depth: radius scale, border weight, shadow presence
- Motion: duration, easing, stagger, reveal distance, and a reduced-motion preview
- Whatever is specific to this page: hero overlay opacity, index behaviour, image treatment

**Drive it through CSS custom properties.** Refactor the page's hard-coded values into variables on `:root` (or the appropriate scope) and have the panel set those. That refactor is most of the work and it's worth doing properly — it's also what makes write-back possible later. Do not rebuild the page as a parallel styled copy.

**Constraints on the panel itself:**
- Dev-only. It must never ship — gate it on the dev environment, keep it out of production bundles, and say plainly how that gating works.
- Self-contained, no new dependencies, no build config changes.
- Its own styling must be isolated from the page it's adjusting, and it must not shift the layout it's measuring.
- Values persist across reloads (localStorage is fine), with a visible reset.
- Font choices must actually load the font before applying it.
- It needs a way to export or copy the current values as plain text, so a session isn't lost if something goes wrong.

Then serve it, tell them where the toggle is, and get out of the way. Let them play before offering an opinion.

## Applying

Write-back is the half most tools miss. When they're happy:

1. Read the current values out of the panel state.
2. Show the **diff against the current values first** — which changed, from what to what. Some will have been moved and moved back.
3. Write them into the right home for this project: the tokens file, the Tailwind or theme config, the CSS custom properties, the design-system file — whatever the project already uses. Never invent a new parallel token system.
4. Keep the semantic names. A value discovered by moving a slider still belongs in `--space-section`, not `--tweak-7`.
5. Offer to remove the panel and the dev-only gating, or leave it in for the next round. Ask; don't assume.

If applying would conflict with a design system the project already has — a Figma library, `.layout/`, a `CLAUDE.md` design section — flag the conflict and let them decide. That system outranks a slider.

## Guardrails

- Never commit the panel to production code paths.
- Check the result still meets AA contrast after a colour change, and say so if it doesn't. A slider will happily produce unreadable text.
- Respect `prefers-reduced-motion` in whatever motion values get applied.
- Don't quietly widen scope — tweaking the hero doesn't license restructuring the page.
- If the user asks for a value that breaks the anti-slop guardrails, that's their call. Note it once, then do it.

## Finishing

Say what changed, where it was written, and whether the panel is still installed. If nothing was applied, leave the panel in place and say so — an unfinished tweak session is a normal state to leave things in.
