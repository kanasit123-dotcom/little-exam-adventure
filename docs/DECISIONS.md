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
- Remaining exam types done in code (parent: "do every type", 2026-10-03): calendar (real October/November 2026 so answers can be checked against `Date`), near-far, jigsaw (CSS crops of existing full-square scene pictures: no new art; options are crops of the same picture's other cells or the same cell of another picture, so exactly one piece fits), a numbered-picture visual for body parts (`labeled`, used by set 29 once the full-body sheet L arrived). Not attempted: cube views from several sides beyond "count the squares seen from above" (needs real 3D drawing), and the handwritten-answer items of the real exam (the game is multiple choice, so they become "pick the sentence/name that matches").
- Sets 29-31 (2026-10-03) from sheets L, M, N. `labeled` marks first sat directly on the picture, but a number covers a small part (an ear is smaller than the number), so each mark gets `lx, ly` at the picture margin and a line to the spot (`kid()` helper in set 29; the labelled picture is drawn at 34dvh so the 12%-apart numbers do not touch). The bank guard in sheet N wears a police-like uniform, so no question puts the bank and the police station among the same options. In the fish story (sheet M) the fish only appear from the third picture although food is poured in the second; questions avoid counting fish before the last picture. Set 31 options are scene pictures, so `scene: true` gives them a bigger size (about 1.6x) with the number and speaker button in a top row.
- Sets 32-34 (2026-10-03) from sheets O, P, Q. The animal sheet was cut by `cutout.py`, which normalises each animal to the same display size, so a kitten looked as big as its mother and the left-right question could not be answered; the `animal-*` pictures were therefore padded onto one 340x340 transparent canvas, bottom-aligned, keeping the real size ratio. Set 33 keeps the small option size for questions that sit under the 12-animal board (a bigger `scene` size overflowed by 124px) and uses `scene: true` only for the board-free transfers. Dates in set 32 (Songkran 13 April, Mother's Day 12 August, Father's Day 5 December, New Year 1 January, Children's Day second Saturday of January) need the parent's check.
- iPad still silent (parent, 2026-10-03): the exam and game-lilly were silent on the iPad while the kitchen game played sound. Known WebKit bugs (291892, 263627; iOS 18-26, mostly home-screen web apps): after the app goes to the background the AudioContext stays "running" but its clock stops and nothing is heard; resume() does not help. `src/core/audio.js` now (1) builds a fresh AudioContext on the next tap after the page was hidden, after a clip whose clock did not move, or when a tap finds the clock stopped, closing the old one, and (2) checks 700 ms after a clip starts whether the clock moved; if not it stops the clip and reads the sentence with the device voice instead. The parent sound test shows how many contexts were built (`ctx#`). game-lilly unlocks audio only on pointerdown (not a valid iOS gesture for audio); it needs the same fix in its own repo.
- iPad sound (parent report, 2026-10-02: no sound on the iPad, sound on the iPhone; cannot be reproduced without the device). Likely causes and what changed in `src/core/audio.js`: (1) iOS silences Web Audio when the mute switch / Control Center mute is on, so the audio session is set to `playback` (`navigator.audioSession`, Safari 16.4+); (2) iOS only counts `touchend`/`click` (not `pointerdown`) as a gesture that unlocks audio, so unlock also listens to `pointerup`, `touchend` and `click`; (3) `ctx.resume()` can never settle without a gesture, which would have left a question (and the listening mode) waiting forever, so resume is bounded to 1.5 s and then reported as an error; (4) device speech did not choose a Thai voice (iOS reads Thai with an English voice = silence), now it does, and reports an error when none exists. The parent page has "🔊 ทดสอบเสียงของเครื่องนี้": it plays the welcome sentence and prints the result and the audio state (context, sample rate, session, last error) so a device problem can be reported precisely. Still to confirm on the real iPad.
- Real-exam listening mode (parent finding, 2026-10-02: in the real exam the teacher reads each question only twice and the question is also written on the paper, so a child who can read a little can guess): optional parent setting `settings.listen: 'twice'` (default `'free'`, unchanged behaviour). In this mode the exam screen itself reads: the block/section instructions once, a shared story twice before its first question, then every question as prompt + all options twice (a gap between rounds); the listen buttons become round badges (n/2, ✓ when done), per-option listen buttons are hidden and the option being read glows like a teacher pointing; "next" unlocks after round 2. A round is counted only when it finishes (`session.replays[qid].round`, stories under `story:<id>`), so a reload or leaving the question cannot be used to hear more, and an interrupted round is read again. The review screen keeps free listening. Sound off = nothing changes. `FIT_TWICE=1 npx playwright test tests/e2e/fit.spec.js` repeats the one-screen check in this mode (the badge is sized like the old listen button so prompts do not wrap).
- One-screen layout (parent request, 2026-09-30: the child gets confused when she has to scroll up and down). Measured every question of every set with a script at the sizes Safari really shows (iPhone 375x553 / 390x664 / 430x739, iPad portrait 768x954 / 820x1080, iPad landscape 1024x700 / 1180x760): before, 129 of 177 questions scrolled on an iPhone and 128 on an iPad in landscape; after, none scroll on 390x664 and up, on iPad portrait or on iPad landscape (iPhone SE 375x553 still scrolls on 16, accepted). What changed (`.lx-compact` in `styles.css`, used by the exam and review screens only): one-row header (icons only on phones), the story shrinks to a one-line chip that opens as a floating sheet when tapped (phones only), listen buttons sit on the question row and inside each option card, "ยังไม่แน่ใจ" moved to the bottom bar between previous and next, picture sizes come from the viewport height (`dvh`) so every device fits, and iPad landscape uses two columns (story and pictures left, question and options right). The review screen got the same treatment; its hint / steps / try-again panels are floating sheets above a bottom bar that also holds the tool buttons. `tests/e2e/fit.spec.js` fails if any question of any set needs scrolling at 390x664, 768x954 or 1024x700. The review screen still scrolls a little on 29 of 177 picture-heavy questions on an iPhone (average 33 px).
- Dev-server gotcha (2026-09-30): after files are rewritten by a script the Vite dev server may keep serving an old module; `touch` the files (and check with `curl http://localhost:5180/src/styles.css`) before trusting a screenshot or a test run.
- Sequence pictures (2026-10-01, set 17): sheet H (four 4-step stories with the same girl) is cut into `pic-seq-<story>-<n>`. Distractors in ordering questions are the reverse order and "last picture first", never a swap of two neighbouring steps, because the road-crossing pictures 2 and 3 (looking left and right / cars stopped) are close enough to be ambiguous. The exam and review screens show these panels larger (exam) or in one row (review on phones).

