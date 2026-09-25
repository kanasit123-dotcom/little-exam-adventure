# Decisions

Updated 2026-09-25. This record and PROJECT-PLAN.md supersede old scaffold behavior.

## Approved Product Direction

- Product: Lily Exam Adventure; independent repository, reuse appropriate original assets/audio/math.
- Audience: age 5-6, school-readiness for Satit Kaset P1; no official-exam or outcome guarantee.
- Six subjects: math, Thai, reasoning, spatial, science, general knowledge. English is not in MVP.
- Session 10-15 questions, default 12; blocks of five, hence 5+5+2.
- Submit/review after each block, optional break, reward after final review.
- Unlimited Thai prompt replay and individual option listening; no exam helpers.
- Original submitted answers and post-teaching responses are separate.
- No timer or punishment; completion rewards independent of correctness and replay.
- Cute calm background outside plain question area; optional buddy silent/still during thinking.
- Buddy gives no correctness signals before block submission.
- Review can use original carry/borrow teaching; test 8+7 and 12-5.
- Source repository and its progress remain untouched.

## Implementation Defaults

These are practical defaults, not claims about school exam rules:
- Keep Vite + plain ES Modules + CSS and the existing physical folder/package name.
- Fixed QA slice with two questions per subject; later session selection persists IDs, order and seed.
- Target 36 authored items: 24 main and 12 transfer. Transfer items do not consume session slots.
- Neutral “not sure” answer is allowed, tracked separately from incorrect/unvisited.
- Show all submitted questions in review, with a filter for questions worth revisiting.
- Detailed review and transfer practice are optional; completion reward does not require correct retries.
- Calm buddy enabled by default; parent can select plain mode. Respect reduced motion.
- Two voice speeds initially: normal and slower; validate intelligibility rather than forcing a specific rate.
- Save locally under little-exam-adventure-v1, with versioning and idempotent rewards.
- Minimal parent summary in slice; adaptive packs, full dashboard, garden and offline in expansion.

## Still Requires Verification

- Current admissions information and any purported official past-exam source.
- Appropriateness/ambiguity of each question and narration, especially reading tasks.
- Artwork redistribution rights, new teacher art and reviewed main-question recordings.
- Suitability of carry/borrow in the first child-facing set versus advanced content; fixtures remain mandatory.
- Real iPad Safari audio/touch results.
- Remote repository: the user chose a public GitHub repository with GitHub Pages (2026-09-26).

These checks must be reported honestly. The unavailable old handoff attachment does not block work from the latest approved specification.

## Superseded

- Old distribution Thai 4 / English 4 / math 4.
- Waiting until all 12 questions are submitted before any review.
- Mandatory stop after a single-question implementation.
- Requiring every review step or a correct retry before earning a reward.
- Treating an iPad-shaped Chromium viewport as real iPad verification.

The documentation update intentionally leaves the old source scaffold unchanged for the next implementation task.

## Implementation Decisions (2026-09-26, first slice)

Agreed with the user or chosen during implementation; see PROJECT-PLAN.md for scope.
- Content follows the format of the third-party "old exam" compilation the user supplied (docs/RESEARCH.md): section banners, one story/chart/map feeding several questions, options numbered **1 2 3** (not ก ข ค). All wording, numbers and pictures are newly authored; nothing is copied.
- Content is organised in sets (`src/content/sets/set-XX.js`, registered in `sets/index.js`). A new set needs no engine change. Each main item links one transfer item.
- Blocks hold at most five questions and never split a shared story (`partition()` keeps stimulus groups together).
- Option order is the authored order and is saved in the session. Explanations say "ตอบข้อ 2", so options are not shuffled.
- Voice: Microsoft `th-TH-PremwadeeNeural` via edge-tts counts as a reviewed recording once the parent has listened and approved (docs/VOICE-REVIEW.md, still pending). Normal and slower speeds are separate recordings, played with Web Audio; device TTS is only a fallback for a missing clip.
- Review has two layers: the answer/explanation, and the "ตัวช่วยคิด" column helper with the look and flow of Lilly's column game (blocks and bundling, carry, borrow strike, keypad, recap), driven by the kitchen's fixed-problem `buildSteps` (no 08/07 leading zero).
- Section banners and shared stories are read aloud once when a new section starts, then the question. "Next" is enabled when that reading ends (or the child uses a listen button); selecting never advances.
- The buddy sits in the top bar during the exam, so it can never cover options or controls. Plain mode hides it.
- Parent page is a plain button (no press-and-hold), with sound on/off, speed and plain/buddy mode, plus the minimal summary.
- Hosting: public GitHub repository and GitHub Pages; `base: './'` and BASE_URL-relative asset paths.
