---
description: Build wide then narrow — generate design variants side by side, pick a direction, then converge
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, WebFetch, Task, AskUserQuestion
argument-hint: [what you're building, e.g. "landing page for an AI analytics tool for startups"]
---

# Design variants: $ARGUMENTS

Stop trying to one-shot a design. Cast a wide net, compare real options side by side, then narrow deliberately. This command runs that funnel.

Read the `design-taste` skill first — the four-part brief, the aesthetic families and the anti-slop guardrails all come from there.

## The funnel

```
5 aesthetics, side by side  →  pick one
        ↓
3 body/layout variants      →  pick one
        ↓
hero imagery: 4 options     →  pick one → colour variants → pick one
        ↓
/tweakbar for the last mile
```

Each stage is a **checkpoint with the user, not a decision to make on their behalf.** The entire value of the exercise is that they see options together and choose. Never skip ahead to a single output because one looked strongest — showing the spread is the point.

Stages can be re-run. If none of the five land, generate five more in different families rather than forcing a choice from a bad spread.

---

## Before generating

Assemble the four-part brief. Pull what you can from `$ARGUMENTS`, the taste library, and the project itself (existing brand, tokens, `CLAUDE.md`, `.layout/`). Ask only for what's genuinely missing — usually intent and audience.

If `.taste/` exists, read it and propose five families from what's actually in there. If it doesn't, propose five from the skill's vocabulary and mention that `/taste` would make this better next time.

Confirm the five families before building. Reordering or swapping one out at this point is cheap; after generation it isn't.

## Stage 1 — five aesthetics

Build five complete, self-contained versions into `design-lab/v1-<family>/`. Each is a real page — hero through footer — with real copy, not lorem. Static HTML with inline or co-located CSS is right here: fast, no build step, no framework decisions leaking into an exploration. If the project has a design system or component library, honour its tokens while still letting the families differ meaningfully.

Generate the five **in parallel** — dispatch a subagent per family via Task, each handed the same intent, guardrails and audience but its own family brief and reference. Independent agents produce genuinely different work; one agent doing five in sequence produces five shades of the first.

Hero imagery at this stage should be a **placeholder that reads correctly** — CSS, SVG or generated pattern that communicates the intended composition. Do not spend on image generation until a direction is chosen.

### The contact sheet

Then build `design-lab/index.html` — the piece that makes this work. It shows all five at once as live scaled iframes in a grid, labelled with family name and a one-line description of the direction. It needs, at minimum: a click-to-open-full-size affordance, and a way to view the same variant at desktop and mobile widths.

Serve it and give the user the URL. Take a screenshot of the contact sheet so the spread is visible in-conversation too, but the browser is where the real judgement happens. Then stop and let them choose.

Do not editorialise before they've looked. Once they have, an opinion is welcome if it's specific.

## Stage 2 — three variants of the winner

Same shape, tighter scope. Three versions of the chosen aesthetic that differ in **body and layout structure** — how the content is organised below the hero — not in palette or font. Ask what specifically they want to see varied if it isn't obvious; otherwise vary the things that actually change how a page reads: content rhythm, the presence and behaviour of a persistent index or nav, how sections are delimited, where scale contrast falls.

Build into `design-lab/v2-<label>/` and extend the same contact sheet rather than making a second one.

## Stage 3 — hero imagery

Now spend on images.

### Check Higgsfield first

Higgsfield is a CLI, not an MCP — "connected" means the CLI is installed and logged in.

```bash
command -v higgsfield >/dev/null 2>&1 && higgsfield account status
```

- **Prints `<email> — <plan>, N credits`** → ready. Note the balance for the cost gate.
- **Installed but not authenticated / session expired** → tell them to run `higgsfield auth login` in their terminal (it opens a browser) and re-run this stage. Never run the login yourself — it needs a real interactive browser device-login.
- **Not installed** → don't install it silently and don't stall the whole command. Explain what it buys them and let them choose:

  > Higgsfield isn't installed. It's what generates the hero image — it gives Claude Code access to essentially every current image and video model (GPT Image 2, Seedance, Nano Banana, Kling) behind one CLI, which is the difference between a real hero and a CSS placeholder. It's paid per generation, and I'll show the cost before spending anything.
  >
  > Install with: `curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh`, then `higgsfield auth login`.

  Then offer the alternatives properly, because the stage should still finish without it: bring their own imagery (a path or URL), use another generator they already have, or stay with a CSS/SVG treatment — which is a legitimate choice for several families, `dither-mono` and `swiss-utility` especially.

Whichever route, everything after this point is identical — the composition work matters more than the generator.

### Generate

Generate four options that fit both the family and the actual hero composition — the crop, the text overlay position, the contrast the headline needs to stay legible. Show them in place in the real page, not as bare images. Then take the chosen one and generate colour and treatment variations of it.

**Cost gate:** image generation costs credits. Before any paid call, state what will be generated, the cost, and the balance it leaves, then wait for explicit confirmation. Never generate a second round without asking. If the balance can't cover the round, say so and stop rather than half-generating.

Check the hero-to-body transition once the real image is in — a hard cut between a full-bleed image and the body is the most common tell that a page was assembled rather than designed.

## Guardrails

- Everything lands in `design-lab/`. Never overwrite the user's real pages during exploration. Only promote a variant into the codebase when they ask.
- Suggest gitignoring `design-lab/` unless they want the exploration in history.
- No fabricated metrics, testimonials, customer logos or press mentions in the sample copy. Use their real content, or clearly placeholder-but-honest content.
- Five near-identical variants is a failed stage-1 — regenerate rather than presenting it.
- Match the feel of references; never reproduce their copy, layout or assets.
- Respect the anti-slop guardrails from the skill throughout.

## Finishing

Tell them what's in `design-lab/`, which variant is live, and what's left. Point at `/tweakbar` for the last mile, and offer to promote the chosen variant into the real codebase as the next step.
