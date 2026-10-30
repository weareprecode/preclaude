# External research: making marketing and product films with Claude and agents

Compiled 19 October 2026 for the reusable film skill. Every claim carries a URL. Anything not confirmed against a source is marked **ASSUMPTION**. Dates are given where the source shows one. Primary sources (official docs, repos, the author's own post) are preferred; secondary sources are flagged as such.

Access notes:
- x.com returned HTTP 402 to direct fetches. The flxrnc thread was read through the public fxtwitter mirror of the same post ID: https://api.fxtwitter.com/flxrnc/status/2105311836190978392 (original: https://x.com/flxrnc/status/2105311836190978392). It is an X Article, not a thread.
- Runway's own help centre (help.runwayml.com) returned 403; Runway guidance is cited from runway.com and a model host's docs instead.
- BBC subtitle guidelines could not be fetched; Netflix's timed text guide is used for caption numbers.

---

## 0. The single most useful source: Florence (@flxrnc), "Opus 5.5 Motion Lab: Make Claude Animate Like a Studio"

Published 30 September 2026, about 1.09M views and 7.7k bookmarks at capture. Source: https://x.com/flxrnc/status/2105311836190978392 (read via https://api.fxtwitter.com/flxrnc/status/2105311836190978392). Everything in this section comes from that article unless another URL is given.

**Method.** Opus 5.5 writes HTML / three.js where every frame is a pure function of time; a headless browser renders frames; ffmpeg encodes. "No fake one-shots. Just motion design with receipts."

**Eight-line prompt template** (fill every line before sending):
- GOAL: what the viewer should feel or do, one sentence.
- OUTPUT: file type and dimensions.
- TIME: seconds x fps = frames, and whether it loops.
- LOOK: hex palette, one accent, typeface, weight, size, tracking.
- MOTION: easing as cubic-bezier, springs as damping ratios, durations in frames.
- SHOTS: frame ranges, one hero move per shot, and the handoff (hard cut, match cut, mask wipe).
- BANNED: defaults you never want to see.
- QA: stills at named frames, contact sheet, fixes, then full render.
- 3D adds MODEL and CAMERA lines.

**Render contract** (paste under any motion prompt): one self-contained HTML file; only named libraries, version-pinned (three.js 0.160.0 via jsDelivr in the article); no network except fonts and pinned libs; every frame a pure function of t; expose `window.renderAt(t)` if JS drives motion; no `Date.now`, no `setTimeout`/`setInterval`, no unseeded randomness; loops render frames 0 to N-1 only.

**Banned defaults list:** purple or blue gradients, glow, lens flares; floating particles as decoration; everything fading in at once; fade-and-slide-up on every element; centred-everything layouts; text that moves while being read. The product experiment also banned bloom, glow orbs, neon, spinning turntables, dark backgrounds and generated text.

**Vague vs directed.** A 27-word "cool 3D product animation... premium and modern" prompt produced navy space, halo, bloom, particles, spinning buds and an invented tagline, i.e. most of the banned list. The directed version (448 words, 15 follow-ups, 4 review rounds, about 90 minutes) replaced each adjective with numbers: "premium" became satin ceramic roughness 0.38 with 0.35 clearcoat; "cool" became a key/fill/rim studio with exact colours; "modern" became a 30 degree FOV orbiting 34 to 10 degrees; "animation" became 120 BPM, 3-frame anticipation, lid spring damping 0.6.

**Motion numbers cheat sheet:**

| Token | Value | Use |
|---|---|---|
| ease-out-expo | cubic-bezier(0.16, 1, 0.3, 1) | text and logo reveals |
| ease-out-quint | (0.22, 1, 0.36, 1) | premium entrances |
| ease-in-out-quart | (0.76, 0, 0.24, 1) | moves, camera pushes |
| ease-in-expo | (0.7, 0, 0.84, 0) | fast exits |
| ease-out-back | (0.34, 1.56, 0.64, 1) | playful overshoot |

- Enter ease-out, exit ease-in, exits 40 to 50% shorter. Linear only for rotation, progress bars, loop phase.
- Springs by damping ratio: 1.0 no bounce; 0.7 to 0.85 premium; 0.4 to 0.6 playful; under 0.3 cartoonish. Remotion default is about 0.5. Position and size may bounce; opacity and colour never.
- Durations: UI feedback 100 to 200 ms; UI moves 200 to 500 ms; hero reveals 600 to 900 ms. Stagger: letters 1 frame (about 30 ms), words 60 to 120 ms, list items 40 to 80 ms; start the next element when the previous is 30 to 50% done.
- One hero move per shot. Secondary moves travel 50 to 70% of the hero's distance and start 100 to 200 ms later; ambient motion under 5% of hero travel.
- Text holds at least 0.3 s per word plus 0.5 s; a slow 2% push keeps holds alive.
- Beat frames = fps x 60 / BPM. Compute each beat as round(n x 60 / BPM x fps), never accumulate rounded values (drift). Cut on the beat; change layout every 4 beats.
- Camera: softest curves; parallax 1.0 / 0.5 / 0.2; 35 to 50 degree FOV start point.
- Accessibility: contrast at least 4.5:1 on every frame; no more than 3 flashes per second.
- Disney principles as numbers (mascot): 11-frame anticipation crouch at 1.2 x 0.75; stretch 0.85 x 1.28; squash 1.25 x 0.7; arms lag 4 frames, legs 6; push key poses 10 to 30% further because phones shrink motion.

**Verification loop:**
1. First render is a draft; expect 2 to 4 rounds.
2. Freeze any frame by URL (`anim.html?t=2.5` calls `renderAt(t)` and pauses all document animations at `t*1000`, re-applied after fonts load).
3. Stills at named frames (0, 24, 48, 72, 96) and a contact sheet of every 12th frame in a 4x3 grid.
4. Onion skins and per-frame position plots to find dead starts and stops.
5. Numeric audit: the mascot was checked on all 480 frames against 71 numeric checks; 6 failed first time.
6. Feedback names frame numbers; fix only the responsible line; if a fix does not hold, render frames either side and compare.
7. Lock each fix into the render contract so it never recurs.

**Sound in code.** Claude cannot listen, so it synthesises audio with the Web Audio API, decodes the finished MP4, measures where each hit peaks, and corrects. Targets: 48 kHz stereo, about -14 LUFS, -1 dBTP (limit the WAV to -2.2 dBTP because AAC raised decoded peaks by about 0.9 dB). Each hit peaks 1 frame after its visual. Hits 3 to 6 dB over the bed; duck the bed about 4 dB at the main hit; check 200 Hz to 6 kHz because sub bass vanishes on phone speakers; 2 ms raised-cosine fades at loop ends.

**Commands from the article:**
```bash
# frames to MP4
ffmpeg -framerate 24 -i out/frames/%04d.png -c:v libx264 -profile:v high -pix_fmt yuv420p -crf 18 -movflags +faststart out/anim.mp4
# contact sheet: every 12th frame, 4x3
ffmpeg -framerate 24 -i out/frames/%04d.png -vf "select='not(mod(n\,12))',scale=400:-1,tile=4x3" -frames:v 1 out/contact.png
# loop seam check: three plays back to back
ffmpeg -stream_loop 2 -i out/anim.mp4 -c copy out/loop_check.mp4
# GIF with one palette
ffmpeg -framerate 24 -i out/frames/%04d.png -vf "scale=1200:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" -loop 0 out/anim.gif
# mix music + SFX, normalise, mux
ffmpeg -i out/anim.mp4 -i music.wav -i sfx.wav -filter_complex "[1:a][2:a]amix=inputs=2:duration=first,loudnorm=I=-14:TP=-1:LRA=11[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart out/final.mp4
```

**Troubleshooting table (abridged):** flicker means something is not a pure function of t (seed randomness, remove timers and CSS transitions); wrong font means load with `display=block` and wait for `document.fonts.ready`; jank means animate only transform and opacity; shimmering text means snap resting text to whole pixels or render at 2x and downscale; "everything moves at once" means one hero, others 150 ms later at 60% travel.

**Model settings:** start at medium effort; raise to xhigh or max only if a from-scratch piece misses twice.

**Tool rule of thumb:** plain HTML for one idea under 10 s; Remotion for series or data-driven video; HyperFrames for web-style timelines; three.js for 3D; Motion or GSAP for motion inside a product.

---

## 1. Code-driven video with Claude

### What works

**Remotion (React, frame-exact).**
- Official Agent Skills: `npx skills add remotion-dev/skills` (also offered by `bun create video`). Twelve skills: `/remotion-best-practices` (router), `/remotion-create`, `/remotion-markup`, `/remotion-studio`, `/remotion-render`, `/remotion-maps` (Mapbox, MapLibre, MapTiler, GeoJSON, CesiumJS flyovers), `/remotion-captions`, `/remotion-saas`, `/remotion-interactivity`, `/remotion-docs`, `/remotion-upgrade`, `/remotion-multimedia`. https://www.remotion.dev/docs/ai/skills and https://github.com/remotion-dev/skills
- Core rules from the markup skill: drive all motion from `useCurrentFrame()` and `interpolate()`; CSS transitions/animations and Tailwind animation classes "will not render correctly"; use `Easing.bezier()` / `Easing.spring()`; compute timing from `fps` via `useVideoConfig()` (e.g. `from={1 * fps}`); load fonts via Google Fonts helper or local fonts; `<Video>`/`<Audio>` from `@remotion/media`; assets via `staticFile()`; one JSX node per editable scene. Sub-files include `motion-blur.md`, `color-correction.md`, `transitions.md`, `voiceover.md`, `silence-detection.md`, `measuring-text.md`. https://raw.githubusercontent.com/remotion-dev/skills/main/skills/remotion-markup/SKILL.md
- Pasting a Remotion docs link into Claude Code fetches the markdown version; docs are optimised for agents. https://remotion.dev/docs/ai/
- Stills before full renders: `npx remotion still src/index.ts MyComp out/still.png --frame=30 --scale=1.5 --props=props.json`. For several frames use `remotion render --frames`. https://www.remotion.dev/docs/cli/still
- Practitioner reports: render stills at frame 0, middle and last with the props you will ship, inspect for overflow, clipping, missing fonts, wrong data; one test caught a squashed badge and a headline that only wrapped in a still. Verify one representative props set before batch renders. (secondary) https://blog.openreplay.com/making-videos-claude-code-remotion/ and https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code
- Licence: free for individuals and companies of up to 3 employees; larger companies need a licence. https://api.fxtwitter.com/flxrnc/status/2105311836190978392 and https://autoae.online/blog/claude-remotion-videos-look-flat

**Lago case study (21 July 2026): "We killed our motion design job".** The strongest real-world process write-up. https://getlago.com/blog/we-killed-our-motion-design-job
- A skill, not a prompt: one-off prompts got far but the agent forgot corrections next time; feedback moved into a versioned instruction set (motion grammar, design tokens, camera engine, storyboard schema, validators). "A skill compounds."
- Three artefacts in order: storyboard (JSON validated against a TypeScript schema), Remotion animatic, final film. Human approves the first two; the expensive render only starts after both.
- Real pixels only: films may only show real Figma frames at 3x; the skill asks for a missing screen rather than inventing one.
- Build emits a timeline, asset manifest, contact sheet of review frames and a 7-category scorecard; ships only at 92/100 or higher. Validators check timing against the motion grammar and scan for banned motion sources.
- "Fix the rule, not the video." Feedback rounds fell from about a dozen to about one over six films; marginal cost one prompt, two approvals, about 30 minutes of unattended rendering.
- Reference style: Linear's films have no voiceover, stock footage or abstract 3D; the camera moves through the real product one action at a time.

**HyperFrames (HeyGen, Apache 2.0).** HTML + CSS + GSAP/three.js rendered deterministically to MP4 by headless browser. Released 17 April 2026 per flxrnc (one secondary source says March 2026). Node 22+ and FFmpeg. https://github.com/heygen-com/hyperframes
- Install: `claude plugin marketplace add heygen-com/hyperframes` then `claude plugin install hyperframes@hyperframes`, or `npx skills add heygen-com/hyperframes`. 21 skills; `/hyperframes` routes; `/product-launch-video`, `/motion-graphics`, `/slideshow`.
- Official verification workflow (hyperframes-cli skill): `npx hyperframes lint` while authoring; `npx hyperframes snapshot --at t1,t2,t3` (also `--composition <id> --frames 8`, `--range 3:5 --frames 8`); `npx hyperframes keyframes <dir> --json` for motion review; `npx hyperframes check --snapshots [--strict]` as final gate; `preview` only after check passes and wait for approval; render `--quality draft` / `looks` / `delivery`; then `ffprobe` the output and extract decoded frames at the same times you reviewed, because "a passing check or successful encode does not confirm the pixels are correct". https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes-cli/SKILL.md
- `/product-launch-video` workflow: brief, capture the real URL (a failed capture stops; no synthetic fallback), one design-system frame preset remixed to brand tokens, storyboard + script approved by the user, narration and music with word timings, one sub-agent per frame, assemble, lint/check/snapshots at midpoints and around cuts, approval, render. Real voice duration overrides estimates; reveals are paced across the whole frame rather than front-loaded then frozen; adjacent frames share an explicit handoff when an element crosses a cut. https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/product-launch-video/SKILL.md

**Plain HTML + Playwright frame stepping.** flxrnc's `render.mjs` opens the HTML headless, freezes at each `i / fps`, saves PNGs; `node render.mjs anim.html 6 24` gives 144 frames. https://api.fxtwitter.com/flxrnc/status/2105311836190978392
- timecut / timesnap do the same by overriding `Date`, `performance.now`, `requestAnimationFrame` and `setTimeout` with a virtual clock in Puppeteer; caveat: CSS transitions/animations may not render as intended. https://github.com/tungs/timecut
- Playwright's built-in `recordVideo` is real-time capture, default scaled to fit 800x800 unless you set size; fine for rough walkthroughs, not for frame-exact motion. https://playwright.dev/docs/videos

**Motion Canvas / Revideo.** Motion Canvas is a TypeScript library plus real-time editor for informative vector animation synced to voice-over; "not meant to be a replacement for traditional video editing software". https://motioncanvas.io/docs/ Revideo is the library-oriented fork with a render API and embeddable player; it shares most of Motion Canvas's animation API. https://docs.re.video/ One 2026 secondary source says Revideo has folded into a commercial editor (Midrender). https://www.wireflow.ai/blog/best-remotion-alternatives-in-2026 Neither ships official agent skills comparable to Remotion or HyperFrames (ASSUMPTION based on not finding any).

**Blender via MCP.** Anthropic launched nine creative connectors including Blender on 28 April 2026 and joined the Blender Development Fund. (secondary) https://digitalproduction.com/2026/04/30/anthropic-funds-blender-ships-claude-connector/ The Blender Lab MCP server v1.0.0 (27 April 2026) needs Blender 5.1+, GPL-3.0, with viewport and thumbnail render tools; Blender Lab warns it executes LLM-generated code without guards and suggests a VM. (secondary) https://www.strayspark.studio/blog/official-blender-mcp-server-comparison-2026 This session has a `blender` MCP with `render_viewport_to_path`, `render_thumbnail_to_path` and `execute_blender_code` (observed in the local tool list, 19 Oct 2026).

**Agent editing of real footage: browser-use/video-use (MIT).** The LLM never watches video: it reads a word-level transcript (about 12 KB) and requests a filmstrip + waveform image only at decision points ("giving an LLM a DOM instead of screenshots"). Cuts on speech boundaries and silence gaps; 30 ms audio fades at each cut; after render it re-inspects every cut boundary for jumps, pops and hidden subtitles and re-renders up to 3 times before showing the user; asks for approval of strategy before cutting; session memory in `project.md`. https://github.com/browser-use/video-use

### Pitfalls
- Default "Claude + Remotion" output reads as a slide deck that learned to move: dark background, glowing headline, gradient blob, pill buttons, every element fading/sliding in on the same spring, system fonts. Fix with real assets (screenshots, footage, product photos), real brand fonts checked in a still, per-element easing, layered parallax. (7 Oct 2026) https://autoae.online/blog/claude-remotion-videos-look-flat
- Lago's early output: near-miss screens, invented icons, placeholder data. The skill cannot produce taste on its own; a weaker model yields competent but less precise films. https://getlago.com/blog/we-killed-our-motion-design-job
- A successful Studio preview does not guarantee fonts or external assets survive the render. (secondary) https://www.tella.com/blog/how-to-use-remotion-agent-skills-with-claude-code
- Claude reads images, not video; animated GIFs are read as the first frame only. Max native long edge on Claude 4.7+ is 2576 px; above 20 images per request a stricter per-image limit applies (keep frames at or under 2000 px). https://platform.claude.com/docs/en/build-with-claude/vision
- Unpinned library versions, `Math.random`, timers and CSS transitions are the usual causes of non-deterministic or flickering renders. https://api.fxtwitter.com/flxrnc/status/2105311836190978392

### Tools / commands
```bash
npx skills add remotion-dev/skills
npx remotion still src/index.ts Promo out/f075.png --frame=75 --props=props.json
npx remotion render src/index.ts Promo out/promo.mp4
npx hyperframes lint && npx hyperframes snapshot --at 0,2.5,5.9 && npx hyperframes check --snapshots --strict
npx hyperframes render --quality delivery --output out.mp4 --strict
ffprobe -v error -show_format -show_streams out.mp4
# contact sheet from a finished MP4 (1 frame per second, 4x3)  [ASSUMPTION: adapted from flxrnc's frames recipe]
ffmpeg -i out.mp4 -vf "fps=1,scale=480:-1,tile=4x3" -frames:v 1 contact.png
# list hard cuts for review  (scdet threshold 8 to 14 recommended by ffmpeg docs)
ffmpeg -i out.mp4 -vf "scdet=t=10" -f null -
```
ffmpeg `scdet` docs: https://ffmpeg.org/ffmpeg-filters.html#scdet

---

## 2. Generative video with agents

### What works

**Higgsfield via CLI (preferred for agents) or MCP.**
- Help centre: Claude Code uses the CLI (`npm` global install, browser login, companion skills); Claude web/desktop uses the MCP connector at `https://mcp.higgsfield.ai/mcp`. https://higgsfield.ai/creator-hub/help-center/integrations/how-do-i-connect-higgsfield-to-ai-agent
- The CLI is argued to be cheaper in an agent loop because MCP loads every tool schema into context (author's argument, not measured). https://www.mindstudio.ai/blog/higgsfield-mcp-vs-cli-claude-code-agents-token-cost
- The higgsfield-generate agent skill (v0.3.0): `higgsfield generate create <model> --prompt ... --start-image ... --end-image ... --duration 12 --wait`; media flags accept a path or a prior job ID; `higgsfield model get <jst> --json` before guessing params; defaults Seedance 2.0 for serious video, Kling 3.0 for cheaper single-plane shots, Veo 3.1 Lite for batch volume; `brain_activity` ("Virality Predictor") scores hook, attention and retention on a finished video. Start/end-frame support: `--start-image` on kling3_0, kling2_6, veo3_1, seedance_2_0; `--end-image` on kling3_0, seedance_2_0.

**Seedance 2.0 (Runway's guide, 24 September 2026).** https://runway.com/resources/seedance-2-0-prompt-guide
- Two layers: outer shot structure in event order ("Shot 1", "Shot 2", primary action first); inner connected sentences. Eight elements: subject, action detail, scene, lighting and colour, camera, style, image quality, constraints (quality and constraints last).
- Within a shot: camera move or transition, then subject action and expression, then spatial change, then audio.
- Let the model set pacing; forced precise timing is unstable.
- Bind every reference: `@Image 1`, `@Video 1`, `@Audio 1`, each with a declared role; name one reference the "sole authority" on attributes that must survive (e.g. product silhouette, markings, colourway); 4 to 5 assets total; headshot plus full-body beats a combined sheet (multi-view sheets can read as several people).
- One camera move per shot; slow continuous motion (sprints, jumps and violent motion are where warping appears).
- Describe visible behaviour, not emotion words. Put "no subtitles, logos or watermarks" in closing constraints.
- Limits: 5 to 15 s; 21:9 to 9:16; 480p/720p/1080p (Fast and Mini max 720p); up to 9 images, 3 videos, 3 audio; reference video+audio share a 15 s budget; reference videos at 720p or lower. Seedance 2.5 noted at up to 30 s.

**Veo 3.1 (Google Cloud, 16 October 2025).** https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1
- Formula: [Cinematography] + [Subject] + [Action] + [Context] + [Style & Ambiance].
- Audio: dialogue in quotes; `SFX:` labels; `Ambient noise:` labels.
- Positive phrasing instead of negatives ("a desolate landscape with no buildings or roads", not "no man-made structures").
- First and last frame: generate both stills with an image model, then describe the transition.
- Ingredients to video: reference images of characters and settings for cross-shot consistency.
- Timestamp prompting: `[00:00-00:02] ...` `[00:02-00:04] ...` inside one generation.
- 720p/1080p, 16:9 or 9:16, 4/6/8 s; all outputs carry SynthID.
- Output is 24 fps (Vertex docs). https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/extend-a-veo-video
- Gemini API price per second (with audio): Veo 3.1 Standard $0.40 (720p/1080p), $0.60 (4K); Fast $0.10 / $0.12 / $0.30; Lite $0.05 / $0.08; charged only on success. https://ai.google.dev/gemini-api/docs/pricing

**Kling 3.0.** Official: start and end frames to video, start frame plus Element reference, multi-shot, native audio, up to 15 s. https://kling.ai/quickstart/klingai-video-3-model-user-guide Director Mode: open with setting and lighting, script shots chronologically with timings, name camera moves, bind characters and props via the Element Library, upload an end frame when the final shot matters. https://kling.ai/blog/kling-video-3-director-mode-multi-shot-tutorial fal (5 February 2026): up to six shots per output, label each shot's framing/subject/motion, keep subject descriptors identical, name every speaker with unique labels and put action before dialogue. https://blog.fal.ai/kling-3-0-prompting-guide/

**Runway Gen-4.5 image-to-video (host docs, 1 December 2025).** "Describe what moves, not what's there"; direct subject channel and camera channel separately and say what stays still; named camera moves; pacing words (slow, gradual, sudden); atmospheric motion (steam, mist, reflections) adds life cheaply. The model can only animate motion the source image supports: a head-and-shoulders portrait cannot stand and walk; off-frame elements fail; start from a wider still. https://runware.ai/docs/models/runway-gen-4-5/guides/directing-motion Official index: https://help.runwayml.com/hc/en-us/sections/47297541368595-Gen-4-5

**Sora 2 (OpenAI cookbook, updated March 2026, marked archived).** Prompt like a storyboard: style cue first, framing, depth of field, action in discrete beats, lighting by source, 3 to 5 palette colours; one camera move and one subject action per shot; parameters (duration, size) must be set in the API call, prose cannot change them; shorter clips follow prompts more reliably (two 4 s clips can beat one 8 s); when close, keep it and describe only the tweak; if a shot keeps failing, freeze the camera, reduce action, clear the background. https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide

**Cross-model consensus.**
- Image-to-video with a locked keyframe beats text-to-video for control; settle composition, casting and style at image cost before paying video cost; iterate at 720p and 4 to 5 s, re-render only locked shots at full quality; cap regenerations (e.g. 3) in advance. (secondary) https://invideo.io/faq/how-do-you-use-720p-vs-1080p-resolution-in-ai-video/ and https://hackernoon.com/the-same-10-seconds-of-ai-video-can-cost-$075-or-$4-track-which-model-is-burning-your-budget
- One camera move per shot (Seedance, Sora, Runway all say so; links above).
- Reuse identical descriptor phrasing for a subject in every shot (Seedance, Kling, Sora; links above).

**Hiding artefacts: grade, grain, conform, cadence.**
- Order: upscale raw ungraded footage first; normalise each clip to a neutral baseline on scopes; then creative grade; add slight blur and film grain last, the same grain over the whole cut so clips from different generations read as one capture medium. Generations drift in colour temperature, contrast and saturation even with identical prompts. (secondary, vendor) https://invideo.io/faq/what-is-the-correct-post-production-order-for-ai/ and https://invideo.io/faq/how-do-you-color-grade-ai-generated-video-clips-to-look/
- AI output lacks sensor noise, lens softness and natural motion blur; keep the blur subtle (removing artificial sharpness, not adding defocus). (secondary) https://invideo.io/faq/why-does-ai-generated-video-look-plasticky-or-fake-and/
- Upscaling: dedicated text/logo restoration exists because general upscalers smear lettering; hands remain a known weak spot. (secondary) https://www.topazlabs.com/learn/how-to-enhance-text-in-images and https://community.topazlabs.com/t/education-how-to-avoid-artifacts-on-hands/97094
- Cadence: keep the timeline at the generator's native 24 fps (Veo is 24 fps per Vertex docs above). **ASSUMPTION:** avoid motion-interpolated conforms (`minterpolate` mi_mode=mci) on AI footage because they compound warping; drop or duplicate frames instead (`fps=24`). ffmpeg minterpolate docs: https://ffmpeg.org/ffmpeg-filters.html#minterpolate
- **ASSUMPTION (pro practice, consistent with Seedance constraint advice):** never let the generator render brand text, logos, UI or numbers; ban them in the prompt and composite the real assets in code (Remotion/HyperFrames) or the editor.
- Short shots hide temporal drift: Hany Farid notes 10 s clips and stitched short clips are themselves a suspicion signal, i.e. cutting short is also what makes AI footage feel AI if overused. (secondary) https://www.ischool.berkeley.edu/news/2025/ai-or-authentic-hany-farid-shares-how-detect-fake-viral-videos-mashable-article

### Pitfalls
- Unbound references cause unwanted borrowing of colour, background or styling; a single undivided paragraph gives one continuous take or random cuts; too much action for the duration rushes the result. https://runway.com/resources/seedance-2-0-prompt-guide
- Combining two camera instructions ("fixed shot" + "orbit") produces jitter or drift. (secondary) https://www.heyuan110.com/posts/ai/2026-07-11-seedance-2-prompt-guide/
- First/last frame pairs must be a believable sequence: same crop, horizon, lens feel and lighting direction. (secondary) https://www.eachlabs.ai/blog/veo-3-1-first-and-last-frame-guide
- Public figures are moderated in Seedance reference inputs. https://runway.com/resources/seedance-2-0-prompt-guide
- Lower resolutions introduce softness and artefacts; small phrasing changes can alter identity. https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide

### Tools / commands
```bash
higgsfield model list --json | jq
higgsfield model get seedance_2_0 --json
higgsfield generate create seedance_2_0 --prompt "$(cat shot03.txt)" --start-image ./kf03_start.png --end-image ./kf03_end.png --duration 5 --wait --json
higgsfield generate create brain_activity --video ./final_9x16.mp4 --wait
# finishing pass  [ASSUMPTION: filter values are starting points, tune by eye]
ffmpeg -i shot.mp4 -vf "lut3d=file=house.cube,noise=alls=6:allf=t,fps=24" -c:v libx264 -crf 16 -pix_fmt yuv420p shot_graded.mp4
```
ffmpeg lut3d (cube, 3dl, dat, m3d, csp): https://ffmpeg.org/ffmpeg-filters.html#lut3d

---

## 3. Editing with agents

### What works

**Loudness.**
- Online default: -14 LUFS integrated, -1 dBTP. YouTube turns loud files down, never up; Meta and TikTok publish no fixed target (estimated about -14, adaptive). (secondary, June 2026) https://www.forasoft.com/learn/audio-for-video/articles-audio/lufs-targets-per-platform-2026
- Leave headroom for the codec: AAC raised decoded peaks about 0.9 dB, so limit the master WAV near -2 dBTP. https://api.fxtwitter.com/flxrnc/status/2105311836190978392
- UK broadcast (TV ads): EBU R128, -23 LUFS plus or minus 0.5 LU, max true peak -1 dBTP with broadcasters recommending -3; at least 6 frames of silence at head and tail. (vendor delivery spec, not Clearcast's own document) https://helpcenter.xr.global/hc/en-us/articles/26187208167060 EBU background on -23 LUFS: https://tech.ebu.ch/files/live/sites/tech/files/shared/tech/tech3401v2_0.pdf
- ffmpeg `loudnorm`: defaults I=-24, LRA=7, TP=-2; two-pass by feeding `measured_I`, `measured_LRA`, `measured_TP`, `measured_thresh` with `linear=true`; reverts to dynamic mode if the target would breach TP or LRA; dynamic mode upsamples to 192 kHz so set `-ar 48000` explicitly. https://ffmpeg.org/ffmpeg-filters.html#loudnorm
- Verify with `ebur128` (momentary, short-term, integrated, LRA). https://ffmpeg.org/ffmpeg-filters.html#ebur128

**Beats and sync.**
- librosa `beat_track(y=y, sr=sr, units='time')` returns tempo and beat times in seconds. https://librosa.org/doc/0.11.0/generated/librosa.beat.beat_track.html
- Final Cut Pro Beat Detection shows a beat grid of song parts, bars and beats; recommends 4/4. https://support.apple.com/en-al/guide/final-cut-pro/ver65b55a2b7/mac
- Editors place cuts 1 to 2 frames before the beat; it reads as synced (practitioner lore, no study). https://birchtree.me/blog/your-eyes-ears-and-brain-dont-agree/ This matches flxrnc's rule that audio hits peak 1 frame after the visual. https://api.fxtwitter.com/flxrnc/status/2105311836190978392
- Perceptual bounds: ITU-R BT.1359 detectability about +45 ms (audio early) to -125 ms (audio late); viewers tolerate late audio far more than early audio. (secondary, sign conventions vary between sources) https://en.wikipedia.org/wiki/Audio-to-video_synchronization
- Cut on musical phrases, drops and energy changes, not every beat. (secondary, vendor) https://invideo.io/faq/can-ai-automatically-cut-a-video-to-the-beat-of-music/

**Captions.**
- Netflix English timed text: 42 characters per line, max 2 lines (stay on one line unless over 42), 20 characters per second for adults (17 for children), bottom-heavy pyramid, break after punctuation and before conjunctions/prepositions, keep article+noun, first+last name, verb+auxiliary together. https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide
- Social burn-in style used by video-use: 2-word UPPERCASE chunks by default. https://github.com/browser-use/video-use
- Remotion has a dedicated `/remotion-captions` skill. https://www.remotion.dev/docs/ai/skills

**Aspect ratios and placements.**

| Platform | Ratios / sizes | Notes | Source |
|---|---|---|---|
| LinkedIn ads | 16:9 1920x1080; 1:1 up to 1920x1920; 4:5 recommended vertical (720x900 rec., up to 1080x1350); 9:16 720x1280 rec., up to 1080x1920 | official | https://www.linkedin.com/help/linkedin/answer/85306 |
| X | 1920x1080 for 16:9; aspect 1:3 to 3:1; 140 s without Premium; GIF 15 MB / 350 frames / 1280x1080 | from flxrnc | https://api.fxtwitter.com/flxrnc/status/2105311836190978392 |
| TikTok | 1080x1920 9:16 target; right column about 22% and bottom about 37% reserved for UI (measured, not published) | secondary | https://www.relevantaudience.com/tiktok-ads/tiktok-video-size-ad-specs/ |
| Meta Reels ads | 9:16, 1440x2560 recommended canvas; margins 14% top, 35% bottom, 6% sides (community consensus); Meta's own rule: ads with disclaimers keep bottom 40% clear | secondary | https://www.inro.social/tools/instagram-reels-safe-zone-checker |
| Meta feed | 4:5 1080x1350 | secondary | https://adsuploader.com/blog/meta-ads-safe-zones |
| Common canvases | 1920x1080, 1080x1080, 1080x1350, 1080x1920 | | https://api.fxtwitter.com/flxrnc/status/2105311836190978392 |

**Palmier Pro (AI-native macOS editor with MCP).** Serves MCP at `http://127.0.0.1:19789/mcp` while open: `claude mcp add --transport http palmier-pro http://127.0.0.1:19789/mcp`. macOS 26 on Apple Silicon only. Releases up to v0.7.6 are GPL-3.0; later binaries are proprietary and the repo no longer takes contributions. https://github.com/palmier-io/palmier-pro This session's Palmier MCP exposes `detect_beats`, `add_captions`, `remove_silence`, `remove_words`, `apply_color`, `inspect_color`, `inspect_timeline`, `capture_frame`, `generate_video`, `upscale_media`, `export_project` and markers with review/resolved states (observed in the local tool list and server instructions, 19 Oct 2026).

### Pitfalls
- No official TikTok, Instagram or Facebook loudness spec exists; vendor blogs quoting -10 to -13 LUFS are unverified. https://www.forasoft.com/learn/audio-for-video/articles-audio/lufs-targets-per-platform-2026
- Platform safe-zone pixel values are mostly community-measured and change without notice; check the platform's template before final export. https://www.relevantaudience.com/tiktok-ads/tiktok-video-size-ad-specs/
- Single-pass `loudnorm` is dynamic and can pump; use two-pass linear for finished masters. https://ffmpeg.org/ffmpeg-filters.html#loudnorm
- Cuts without short audio fades pop. https://github.com/browser-use/video-use
- Sub bass vanishes on phone speakers; check 200 Hz to 6 kHz. https://api.fxtwitter.com/flxrnc/status/2105311836190978392

### Tools / commands
```bash
# loudness pass 1: measure
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:print_format=json -f null -
# loudness pass 2: apply measured values linearly
ffmpeg -i mix.wav -af loudnorm=I=-14:TP=-1:LRA=11:measured_I=-19.2:measured_TP=-3.1:measured_LRA=6.4:measured_thresh=-29.5:linear=true -ar 48000 mix_norm.wav
# verify
ffmpeg -i final.mp4 -af ebur128=peak=true -f null -
# burn captions  [ASSUMPTION: requires ffmpeg built with libass]
ffmpeg -i in.mp4 -vf "subtitles=captions.srt:force_style='FontName=Inter,FontSize=18,Outline=0,Shadow=0'" -c:a copy out.mp4
```
```python
import librosa
y, sr = librosa.load("track.wav")
tempo, beats = librosa.beat.beat_track(y=y, sr=sr, units="time")
fps = 24
cut_frames = [round(t * fps) - 1 for t in beats]  # cut 1 frame early (practitioner rule)
```

---

## 4. Motion design taste: premium versus slop

### What works
- Replace adjectives with numbers; name the model's defaults and ban them after the first render; one hero per shot; "check frames, not feelings". https://api.fxtwitter.com/flxrnc/status/2105311836190978392
- Real product, real pixels: Linear-style films move a camera through the real product one action at a time, with no voiceover, stock footage or abstract 3D. https://getlago.com/blog/we-killed-our-motion-design-job
- Apple-style product films: slow-build hero reveal (product enters slowly, light changes), then detail shots, then product in context; light panels swept across edges to draw lines of light; deep depth of field on macro. (practitioner tutorial) https://www.manfrotto.com/global-uk/stories/how-to-shoot-cinematic-tech-videos-like-apple/ Keynote films are distinguished by near-invisible transitions, e.g. a match cut from a camera module close-up to Apple Park that is hard to find without frame-stepping. https://9to5mac.com/2023/06/21/apple-keynote-videos-transitions-and-editing/
- Hybrid pipelines dominate high-end AI-assisted work: AI for generated motion, After Effects/Premiere (or code) for logo reveal and on-screen typography; real product photography grounds credibility. (portfolio, secondary) https://contra.com/p/MFEgBNOQ-aether-brand-manifesto-film-a
- Film timing is slower than UI timing. UI guidance (Emil Kowalski's widely mirrored rules) keeps UI animation under 300 ms with ease-out `cubic-bezier(0.23, 1, 0.32, 1)` and avoids ease-in. (mirror) https://www.ui-skills.com/skills/emilkowalski/emil-design-eng Film hero reveals run 600 to 900 ms and text holds 0.3 s per word plus 0.5 s. https://api.fxtwitter.com/flxrnc/status/2105311836190978392 **ASSUMPTION:** UI-tuned durations used in a film read as frantic; use film values for anything the viewer must read.
- Kinetic type: sans serif for clarity under motion; key words on screen long enough to digest (about 3 s rule of thumb); test with someone unfamiliar with the copy; limit simultaneous animated elements; test sound-off and at faster playback because type doubles as captions. (course page and blog, low authority) https://canvas.santarosa.edu/courses/28549/pages/week-11-page-7-kinetic-typography and https://www.moonb.io/blog/kinetic-typography
- Depth: foreground, midground, background layers at different speeds with blur on the back layer. https://autoae.online/blog/claude-remotion-videos-look-flat
- Motion blur via sub-frame accumulation (180 degree shutter equivalent) for 3D. https://api.fxtwitter.com/flxrnc/status/2105311836190978392 Remotion has a `motion-blur.md` rule file. https://raw.githubusercontent.com/remotion-dev/skills/main/skills/remotion-markup/SKILL.md

### Slop tells to ban (compiled)
Purple/blue gradients, glow, lens flares, decorative particles, bloom, neon, dark navy "space" backgrounds, spinning turntables, invented taglines, everything fading in together, fade-and-slide-up on every element, centred everything, text moving while being read (flxrnc, link above); gradient blobs, pill buttons, same spring on everything, system fonts (https://autoae.online/blog/claude-remotion-videos-look-flat); near-miss screens, invented icons, placeholder data (https://getlago.com/blog/we-killed-our-motion-design-job); "no stock footage, no fake UI, no generic neon technology visuals" (vendor guide) https://motion.so/learn/apple-style-product-launch-video

### Pitfalls
- I found no primary behind-the-scenes from Linear, Stripe or Vercel on how their launch films are made; descriptions of their style here are second-hand (Lago). Treat brand-style claims as interpretation.
- Kinetic typography sources are weak (blogs, course pages); the numeric guidance from flxrnc is the most concrete available.

---

## 5. Disclosure and compliance (UK/EU ads, platforms)

### What works / what the rules say

**UK: ASA/CAP, 29 May 2025.** https://www.asa.org.uk/news/disclosure-of-ai-in-advertising-striking-the-balance-between-creativity-and-responsibility.html
- "No blanket legal requirement in the UK to disclose the use of AI in ads."
- Two questions: is the audience likely to be misled if AI use is not disclosed; if so, does the disclosure clarify or contradict the ad's message.
- "Disclosure alone is very unlikely to mitigate the harm caused by a fundamentally misleading message." An AI image overstating a product's effect is misleading with or without a label.
- Routine edits (removing background elements, improving weather) make little difference to consumer perception.
- ISBA/IPA principles: be transparent where AI features prominently and is unlikely to be obvious.
- June 2026 ASA guidance on AI content and deepfakes reiterates existing rules apply in full regardless of how ads are made (Polyverse ruling). (secondary) https://www.lewissilkin.com/insights/2026/06/18/asa-warns-on-ai-generated-content-and-deepfakes-102n4o1
- Ad Association best-practice guide for SMEs (February 2026). https://adassoc.org.uk/wp-content/uploads/2026/02/Best-Practice-Guide-for-the-Responsible-Use-of-Generative-AI-in-Advertising_SME-Version.pdf

**EU AI Act Article 50.** https://artificialintelligenceact.eu/article/50/
- 50(2) providers must mark synthetic output machine-readably; 50(4) deployers must disclose deepfake image, audio or video as artificially generated or manipulated; for evidently artistic, creative, satirical or fictional works the duty is limited to disclosing the existence of such content without hampering enjoyment; 50(5) disclosure must be clear and distinguishable at the latest at first exposure.
- Applies from 2 August 2026. The Digital Omnibus moved the 50(2) marking duty for systems already on the market to 2 December 2026; 50(4) deepfake disclosure was not delayed. Omnibus reported published in the Official Journal 24 July 2026, in effect 27 July 2026. (secondary; OJ citation not verified) https://www.mccannfitzgerald.com/knowledge/data-privacy-and-cyber-risk/ai-act-round-up-recent-developments and https://www.williamfry.com/knowledge/eu-ai-act-omnibus-deal-reached-postponed-deadlines-watermarking-compromise-and-the-nudificiation-prohibition/
- Commission's voluntary Code of Practice on marking and labelling AI-generated content, final version 10 June 2026. (secondary) https://emerging-europe.com/europes-ai-labelling-rules-arrive/
- Penalties up to EUR 15M or 3% of turnover for Article 50 breaches. (secondary) https://www.lumenova.ai/blog/eu-ai-act-article-50-article-5/

**Platforms.**
- YouTube: disclose meaningfully altered or synthetic content that seems realistic (real person saying/doing something they did not; altered real event or place; realistic scene that never happened) via the "altered content" setting in Studio; clearly unrealistic/animated content, beauty filters and production assistance are exempt; YouTube may apply labels itself. https://support.google.com/youtube/answer/14328491
- Meta ads: "AI info" label for ads created or significantly edited with Meta's GenAI tools, and for third-party AI detected via industry-standard signals; photorealistic AI humans get the label next to "Sponsored"; labels live in "About this ad"; political/social-issue ads have stricter disclosure. (updated 1 June 2026) https://about.fb.com/news/2025/02/gen-ai-transparency-metas-ads-products/
- TikTok: creators must label realistic AIGC (AI-generated label or sticker/caption); TikTok auto-labels via C2PA Content Credentials; unlabelled AI content may be removed. (2024 news coverage; current help page could not be read) https://tubefilter.com/2024/05/09/tiktok-transparency-labels-for-generative-ai-content/
- LinkedIn: shows the C2PA icon on images and video signed with Content Credentials, revealing whether AI generated or edited the content; only works if the file already carries the credential; rolling out gradually. https://www.linkedin.com/help/linkedin/answer/a6282984

### Pitfalls
- A disclosure cannot rescue a misleading claim (ASA, above). For a product film this matters most when generated footage depicts product capability (e.g. a nav screen or map output that the product cannot actually produce).
- **ASSUMPTION:** re-encoding with ffmpeg rewrites the container and drops any C2PA manifest from the generator, so provenance must be re-signed after the final encode if wanted. The CAI notes every modification needs a fresh signed manifest. https://learn.contentauthenticity.org/signing-your-first-asset Platforms also strip metadata in transit. https://filmdaft.com/content-credentials-and-provenance-c2pa-a-creator-workflow/
- Veo outputs carry SynthID regardless (Google Cloud guide, section 2 link), so platforms may label AI footage even when you did not.

### Tools / commands
```bash
# inspect any Content Credentials on a file  [ASSUMPTION: confirm flags with c2patool --help]
c2patool final.mp4
```

---

## 6. Review and QA practice

### What works
- Humans are near chance at spotting AI media: 1,276 participants averaged close to 50%; worse for faces and single-modality stimuli; prior familiarity did not help. https://arxiv.org/abs/2403.16760v4 (CACM version: https://cacm.acm.org/research/as-good-as-a-coin-toss-human-detection-of-ai-generated-content)
- Video-specific (IASDR 2025, 87 participants, 36 clips, Veo 3 / LTX / Wan): 60% overall; image-to-video clips spotted 79%, real footage 64%, outpainting 49%, text-to-video 43%; environmental clips often mislabelled as AI; consistent bias towards guessing "AI". https://dl.designresearchsociety.org/iasdr/iasdr2025/pictorials/18
- Claude itself "cannot determine whether an image is AI-generated" per Anthropic's vision docs, so the agent cannot be the real-vs-AI judge. https://platform.claude.com/docs/en/build-with-claude/vision
- Forensic checks that still have value: shadows should point back to a single light source; reflections and vanishing points should be consistent; physics; suspicion of very short or stitched clips. https://www.ischool.berkeley.edu/news/presscoverage/2026/hany-farids-ted-talk-mentioned-forbes-article-discussing-identifying-ai and https://www.ischool.berkeley.edu/news/2025/ai-or-authentic-hany-farid-shares-how-detect-fake-viral-videos-mashable-article
- Temporal consistency over longer durations is where AI video still slips. (blog) https://outthink.io/community/thought-leadership/blog/how-to-tell-if-a-video-is-ai-generated/
- Agent-side QA that works (from sections 0 and 1): stills at named frames; contact sheets; onion skins and speed graphs; numeric per-frame audits; boundary checks at every cut; decode the final MP4 and re-check the same timestamps; scorecard gate (Lago 92/100); human approval gates before expensive steps.
- Hook/retention scoring on a finished cut: Higgsfield `brain_activity` (local skill, section 2).

**Recommended blind-test protocol for the skill** (ASSUMPTION: synthesised from the studies above, not a published standard):
1. Two-alternative forced choice: mix our generated shots with real reference footage of the same subject, randomised, viewed on a phone at native size and speed.
2. Panel of at least 5 people who did not make the film; record "real or AI" plus confidence and the reason.
3. Treat 50 to 60% "AI" calls as the baseline bias; a shot that is called AI far more often than real footage is a reshoot candidate.
4. Separate test for the claim risk: would a viewer believe the product does what the shot shows? (ASA test.)
5. Score taste separately from realism: compare against one named premium reference film per brief.

### Pitfalls
- Viewers already over-call "AI" (IASDR bias), so a high AI-call rate alone is not proof of a bad shot; compare against the real-footage control.
- Studies use short clips; longer pieces give viewers more chances to spot drift.
- Detection research moves fast; DF26 (arXiv 2609.07369, humans 52.6% on 2,691 clips) is reported only by a vendor and was not verified. https://truescreen.io/articles/deepfake-detection-accuracy-falls-49-percent/

---

## 7. Ranked: the 15 most valuable techniques for the skill

1. **Make the film a skill, not a prompt; fix the rule, not the video.** Every correction goes into a versioned rule set and validators so the next film inherits it (Lago: feedback rounds fell from about 12 to about 1). https://getlago.com/blog/we-killed-our-motion-design-job
2. **Gate the expensive step behind human-approved storyboard and animatic.** Storyboard as schema-validated JSON, then a cheap animatic, then render. https://getlago.com/blog/we-killed-our-motion-design-job and https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/product-launch-video/SKILL.md
3. **Render contract: every frame a pure function of time.** No timers, no `Date.now`, no unseeded randomness, no CSS transitions in Remotion, pinned library versions, fonts awaited. https://api.fxtwitter.com/flxrnc/status/2105311836190978392 and https://raw.githubusercontent.com/remotion-dev/skills/main/skills/remotion-markup/SKILL.md
4. **Stills and contact sheets before full renders, then re-check the decoded final at the same timestamps.** `remotion still`, `hyperframes snapshot --at`, ffmpeg tile sheets; a passing encode does not prove the pixels. https://www.remotion.dev/docs/cli/still and https://raw.githubusercontent.com/heygen-com/hyperframes/main/skills/hyperframes-cli/SKILL.md
5. **Replace adjectives with numbers and ship a banned-defaults list.** Easing as cubic-bezier, springs as damping ratios, durations in frames; after the first render add whatever defaults appeared to BANNED. https://api.fxtwitter.com/flxrnc/status/2105311836190978392
6. **Real pixels only.** Show real product screens and real brand assets; ask for a missing screen instead of inventing one; never let a generator render logos, UI or text. https://getlago.com/blog/we-killed-our-motion-design-job and https://runway.com/resources/seedance-2-0-prompt-guide
7. **One hero move per shot, with a motion token table.** Enter ease-out-expo, move ease-in-out-quart, exit ease-in-expo 40 to 50% shorter; secondaries 50 to 70% travel starting 100 to 200 ms later. https://api.fxtwitter.com/flxrnc/status/2105311836190978392
8. **Keyframe-first generative video.** Lock start (and end) frames as stills at image cost, then image-to-video; describe only what moves; one camera move per shot. https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-veo-3-1 and https://runware.ai/docs/models/runway-gen-4-5/guides/directing-motion
9. **Bind every reference to a role and name a "sole authority".** `@Image 1` is the authority on product silhouette and colourway; reuse identical subject descriptors in every shot. https://runway.com/resources/seedance-2-0-prompt-guide
10. **Draft cheap, commit late, cap retries.** 720p, 4 to 5 s drafts; re-render only locked shots; set a regeneration cap; know the per-second price (Veo 3.1 Fast $0.10 to $0.12/s vs Standard $0.40/s). https://ai.google.dev/gemini-api/docs/pricing and https://hackernoon.com/the-same-10-seconds-of-ai-video-can-cost-$075-or-$4-track-which-model-is-burning-your-budget
11. **Unify mixed sources in finishing.** Normalise each clip, one grade (LUT), one grain layer over the whole cut, subtle softening, keep native 24 fps. https://invideo.io/faq/what-is-the-correct-post-production-order-for-ai/ and https://docs.cloud.google.com/vertex-ai/generative-ai/docs/video/extend-a-veo-video
12. **Beat grid from code; cut a frame early.** librosa beat times, frame = round(t x fps) computed per beat (no accumulated rounding), cuts 1 frame before the beat, layout changes every 4 beats. https://librosa.org/doc/0.11.0/generated/librosa.beat.beat_track.html and https://api.fxtwitter.com/flxrnc/status/2105311836190978392
13. **Two-pass loudness to the destination spec.** Online -14 LUFS / -1 dBTP with WAV limited near -2 dBTP for AAC; UK broadcast -23 LUFS plus or minus 0.5 LU; verify with `ebur128`; check the 200 Hz to 6 kHz band for phones. https://ffmpeg.org/ffmpeg-filters.html#loudnorm and https://helpcenter.xr.global/hc/en-us/articles/26187208167060
14. **Transcript-first editing of real footage with boundary self-checks.** Read word-level transcripts, look at filmstrips only at decision points, 30 ms fades at cuts, re-inspect every cut boundary and re-render up to 3 times before showing a human. https://github.com/browser-use/video-use
15. **Compliance check as a release gate.** ASA two-question test (and no disclaimer can rescue a misleading capability shot); EU Article 50(4) deepfake disclosure from 2 August 2026; tick YouTube "altered content", expect Meta "AI info" and TikTok C2PA auto-labels; human blind 2AFC panel for realism because neither people nor Claude can reliably spot AI. https://www.asa.org.uk/news/disclosure-of-ai-in-advertising-striking-the-balance-between-creativity-and-responsibility.html, https://artificialintelligenceact.eu/article/50/, https://support.google.com/youtube/answer/14328491, https://platform.claude.com/docs/en/build-with-claude/vision
