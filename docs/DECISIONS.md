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
- Set picker (user request, 2026-09-26): home → "เลือกชุดข้อสอบ" → cards per set showing not started / in progress (answered count, tap resumes) / completed (times, last and best first-answer score). Per-set results live in `state.progress` (unbounded, separate from the 10-entry session history) and are written by the same idempotent `claim` update. Starting another set while one is in progress asks first and keeps the old one in history.
- Voice speed (parent request, 2026-09-26: the child could not keep up): normal −20% and slower −35% (were −10% / −30%), plus 0.8 s silence between section, story and question (0.5 s in review). Changing a rate in `design/voice.py` re-records that whole speed; the run is resumable.
- Special sets (2026-09-27, `src/content/library.js`): a mock exam draws 30 main questions from every set (5 per subject, shared stories kept together, new draw each start, saved in the session) and a practice set replays up to 10 questions the child answered wrong or not sure. The exam screen passes each submitted answer's result to the reducer, which keeps `state.mistakes` (max 200) and removes a question once it is answered correctly. Item ids must be unique across sets; shared-story keys are prefixed with the set id inside the combined library.
- Friend stickers (Lilly's request, 2026-09-27): the reward is now one of the 11 game friends (five more copied from game-lilly); picking the same friend again grows it small → medium → large → very large (`rewards.friends`, `src/core/friends.js`), shown with a small size label in the album and on the reward. Earlier item stickers stay in the album.
- Review access (parent request, 2026-09-27): the review screen lists every submitted question across blocks (tap a number to open it), and "📖 ดูเฉลย" on the break, reward and later exam screens reopens it (`openReview`), returning to the same place with "กลับ".
- Phrase pauses (parent request, 2026-09-27: "reads the words too close together"): edge-tts left only ~0.05 s at spaces. `design/voice.py` now sends a comma instead of the space between phrases (~0.3 s; a line break gave ~1.4 s, too long), but not next to numbers ("2 ตัว", "8 ลบ 5", "ตอบข้อ 3") except after an option number ("ข้อ 1, ส้ม"). The manifest records `style`; changing `STYLE` re-records only sentences whose spoken text has a pause, and clip URLs carry `&s=<style>` so devices do not keep old cached clips.
- New set format from set 12 (parent request after a second reading of the old exams, 2026-09-27): 15 main questions in three blocks of five — one story with five questions, one picture board (`board`, 6-12 pictures) with five classification questions, then multi-step math, code-drawn figure sequences (`figure-row`, option `svg.figure`: `wheel` 0-7, `arrow`, `dots`), manners and kinship. Picture-only options may have four choices (parent chose 4, like the real exam); text options stay at three. Sets 1-11 are unchanged.
- Mock exam with five-question stories (2026-09-27): stories stay complete, so the picker now packs the chosen groups into blocks of five (largest first) and refuses a group that would need more than seven blocks; 2000 random draws gave 30 questions, every subject 3-6, at most 6 blocks.
- One-screen layout (parent request, 2026-09-30: the child gets confused when she has to scroll up and down). Measured every question of every set with a script at the sizes Safari really shows (iPhone 375x553 / 390x664 / 430x739, iPad portrait 768x954 / 820x1080, iPad landscape 1024x700 / 1180x760): before, 129 of 177 questions scrolled on an iPhone and 128 on an iPad in landscape; after, none scroll on 390x664 and up, on iPad portrait or on iPad landscape (iPhone SE 375x553 still scrolls on 16, accepted). What changed (`.lx-compact` in `styles.css`, used by the exam and review screens only): one-row header (icons only on phones), the story shrinks to a one-line chip that opens as a floating sheet when tapped (phones only), listen buttons sit on the question row and inside each option card, "ยังไม่แน่ใจ" moved to the bottom bar between previous and next, picture sizes come from the viewport height (`dvh`) so every device fits, and iPad landscape uses two columns (story and pictures left, question and options right). The review screen got the same treatment; its hint / steps / try-again panels are floating sheets above a bottom bar that also holds the tool buttons. `tests/e2e/fit.spec.js` fails if any question of any set needs scrolling at 390x664, 768x954 or 1024x700. The review screen still scrolls a little on 29 of 177 picture-heavy questions on an iPhone (average 33 px).
- Dev-server gotcha (2026-09-30): after files are rewritten by a script the Vite dev server may keep serving an old module; `touch` the files (and check with `curl http://localhost:5180/src/styles.css`) before trusting a screenshot or a test run.

