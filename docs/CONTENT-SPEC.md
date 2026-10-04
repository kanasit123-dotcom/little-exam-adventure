# Content Specification

Approved scope: six subjects, 12 main questions per default session, review after blocks of five. Existing src/content/vertical-slice-12.js is a stale prototype and must be revised during implementation.

## Coverage

| Subject ID | Thai name | Suggested slice skills, two main items each |
| --- | --- | --- |
| math | คณิตศาสตร์ | Quantity comparison/counting; age-reviewed arithmetic |
| thai | ภาษาไทย | Listening comprehension; sound/letter or word discrimination |
| reasoning | เชาวน์ปัญญา | Classification; pattern continuation |
| spatial | มิติสัมพันธ์ | Position/orientation; matching parts or shapes |
| science | วิทยาศาสตร์ | Observable properties; simple everyday cause/effect |
| general | ความรู้รอบตัว | Daily routines; appropriate everyday choices |

These are proposed original item topics, not a verified school syllabus. Replace unsuitable items following content review without silently changing coverage.

Target pack: 24 main items (four per subject) + 12 transfer items (two per subject) = 36 total. The fixed slice selects 12 main IDs. Transfer questions are separate learning activities, not extra baseline questions. Content validation must not require every future pack to contain exactly 12 items.

## Authoring Schema

Each question needs:
- id, version, subject, skillIds, familyId, difficulty, itemType (main/transfer).
- sourceId, provenance (original/official/third-party-practice), rights note and review status.
- promptText, promptSpeech, promptAudioId.
- kind and optional task-essential visual descriptor with neutral accessibility text.
- options with stable id, display content, speech text/audio ID.
- correctOptionId and review object, available only outside exam view.
- review: summary, hints, ordered explanation steps, optional fixed column problem and transfer IDs.
- narration policy describing what listening reveals and what skill this item actually measures.

Use a validated JSON-compatible data structure; existing JS exports are acceptable. Keep asset references as registry IDs, not cross-repo paths. Version released content rather than changing an active attempt's questions in place.

## Content Rules

- Exactly one unambiguous correct answer for each supported choice item; unique option IDs and distinct visible options.
- Avoid cultural assumptions that make multiple everyday answers reasonable.
- Include images only when needed to solve the task; do not add counting pictures to a symbolic arithmetic item.
- Do not name the correct shape/object in alt text or speech when identifying it is the task.
- For spatial options, consistent scale/cropping/background; do not let incidental decoration reveal the match.
- Individual option audio remains available. If pronunciation would disclose the answer of a reading task, redesign the task or honestly classify it as listening-supported; don't pretend it measures unaided reading.
- Thai vowel placeholders use a hyphen (for example -ี or เ-ะ); remove the placeholder when composing an actual word. Test combining marks visually.
- Explanation steps must actually teach the authored problem, not generic encouragement.
- Main prompt and option recordings require human listening review before child-facing release.
- No hint, explanation, correctness label or full authoring object enters the exam renderer.

## Arithmetic

Adapt original column logic into pure fixed-problem steps used only in review.
Mandatory fixtures:
- 8 + 7 = 15: write five units and carry one ten.
- 12 - 5 = 7: borrow one ten, resulting in twelve units; no misleading leading zero.

Fixtures are engineering tests and review demos, not proof these operations appear on the school's exam. Final child-facing placement requires content review.

## Transfer and Exposure

Transfer items must change the problem, not only reorder options. Link them by skill/family. Store learned-attempt results separately and never rewrite submitted baseline answers. A later main item in a skill already taught during this session receives an exposure flag. Do not count guided transfer as independent first-attempt accuracy.

## Research Register

Create docs/RESEARCH.md with source ID, issuer, title, URL, year, checked date, source classification, supported claims and reproduction rights. See PROJECT-PLAN.md for starting sources and their limitations. No verified official past paper is currently established.

## Validation Gates

- All references resolve; main/transfer types, subject IDs and review steps validate.
- Fixed QA slice has two main items per subject and no duplicate IDs.
- No duplicate item within a session; option order persists across reload.
- Transfer links resolve and are not reused as unseen baseline items in that session.
- Correct answer belongs to options; asset/audio IDs exist.
- Detect stale English content in the MVP pack.
- Human signoff covers accuracy, speech, visual fairness, age suitability and source classification.

## Implemented Schema (2026-09-26)

A set file exports `{ id, version, title, note?, order, stimuli, items }` (`note`: up to 60 characters shown on the set card):
- `order`: main item ids in play order. Items sharing a stimulus must be adjacent.
- `stimuli[id]`: `{ section, text, speech?, visual? }`, a story, chart or map used by several items.
- Item: `id, type ('main'|'transfer'), subject, skillIds, familyId, difficulty (1-3), sourceId, provenance, rights, reviewStatus, narration`, then `stimulus?` or `section?`, `prompt { text, speech? }` (a line break inside a riddle is read as one sentence), `visual?`, `options[{ id, text?, image?, speech? }]` (3 options, labelled 1 2 3), `correctOptionId`, `review { summary, hints[], steps[], column?, transferIds? }`.
- Visual types: `image`, `pictograph`, `compass-map`, `dice`, `polygon`, `row` (pictures left to right), `clock` (hour 1-12, minute 0/30), `table` (name + count), `number-row` (numbers with one `?`), `shape-count` (3-9 triangle/circle/square), `equivalence` (left picture = right picture × count), `scatter` (2-4 kinds, up to 16 pictures), `stack` (1-5 columns of 1-5 boxes), `grid` (2-3 rows of 2-3 pictures, for above/below/between; positions are not read aloud), `board` (6-12 different pictures shared by several questions; the stimulus text names them), `figure-row` (3-5 code-drawn figures with one `?`), `figure-grid` (2x2 or 3x3 figures with exactly one `?`: a missing piece or a Latin-square cell); figures are `{ wheel: 0-7 }`, `{ arrow: up|right|down|left }`, `{ dots: 1-9 }`, `{ half: tl|tr|br|bl }` (square with one diagonal half shaded) or `{ shape: circle|square|triangle|hexagon|diamond, fill?: empty|dots|solid }`, all also usable as option `svg: { figure }`. Other code-drawn options: `svg: { count: { asset, n } }` (n copies of one picture, 1-10, for questions whose answer is a quantity the child counts; give it a `speech` such as "มะม่วง 5 ผล") and `svg: { venn: both|circle|square|none }` (a circle overlapping a square with a star in one region; keep its speech empty), all drawn in `src/visuals/visuals.js`. `row` takes `labels: true` (ก ข ค ง captions for ordering questions) and `sides: true` (left/right captions); one item may be `'?'` (a dashed blank box for picture patterns).
- Picture-free options can use `svg: { fold: 'heart' | 'crescent' | 'lshape' | 'star' | 'circle' | 'flag' }` (dashed fold line, symmetry) or `svg: { cut: 'halves' | 'uneven-halves' | 'quarters' | 'uneven-quarters' | 'eighths' | 'uneven-eighths' }` (cake seen from above, equal sharing; 'eighths' = 8 equal pieces for 8 friends, 'uneven-eighths' = 8 pieces of different sizes).
- Audio ids are derived: every sentence from `src/content/speeches.js` is recorded by `npm run voice` and looked up by exact text in `public/voice/th/manifest.json`. `tests/voice.test.mjs` fails if any sentence lacks a clip.
- `promptAudioId` / per-item version from the draft schema are replaced by this text→clip manifest and the set `version`.
- Visual types added in sets 27-29 (2026-10-03): `calendar` (`{ month, start: 0-6 weekday of day 1 (0 = Sunday), days: 28-31, marks?: [dates] }`, at most 5 weeks so it fits the screen; Sundays are red like a real calendar; `tests/visuals3.test.mjs` checks the month against the real Date), `jigsaw` (`{ asset, missing: tl|tr|bl|br }`: a picture cut into 2x2 with one cell missing; options are `svg: { piece: { asset, cell } }` = CSS crops of existing pictures, so no new art; pick full-square scene pictures such as pic-mountain, pic-school, pic-beach, pic-market, pic-waterfall, pic-temple), `distance` (`{ items: [{ asset, size 0.2-1 }] }` 3-4 copies of one picture, smaller and higher = farther, numbered below; the test checks "farthest" = smallest, "nearest" = largest), `labeled` (`{ asset, marks: [{ n 1-9, x, y in %, lx?, ly? }] }` numbers on a picture, for "which part does number 3 point to"; `x, y` is the spot pointed at, and when `lx, ly` are given the number sits there (the picture margin) and a line is drawn to the spot, so small parts such as an ear are not covered; set 29 builds them with `kid('girl', [1, 'hair'], ...)` from measured spots). Visual `cubes` (set 35): `{ rows: [[heights back row], ..., [front row]] }` 1-3 rows of 1-4 stacks, 0-3 cubes high, drawn obliquely (front faces are true squares, back rows shift up-right); a front stack may not be taller than the stack behind it and no row or column may be empty. Option drawings `svg: { front: [heights left to right] }` and `svg: { top: [[0/1 per cell], back row first] }`; `frontView`, `topView` and `cubeCount` in `src/visuals/visuals.js` compute the true answers and `tests/cubes.test.mjs` checks every view and count question. An item may set `scene: true` when its options are detailed scene pictures (set 31): the option pictures are drawn larger and the number and speaker button share the top row of each card.
- Compact options (set 17, 2026-10-01): an item may set `compact: true` to lay three SHORT text options (like `ค ก ง ข`, `ภาพ ก`, `ภาพที่ 3`, each about 8 characters or less) in one row of cards instead of three rows; this frees height for big story pictures. A stimulus may set `textHidden: true` when its text is only spoken (for example "four pictures labelled ก ข ค ง"): the text is read aloud but no story strip is shown. Ordering questions keep their labelled panels as a `row` with `labels: true`; `tests/sequence.test.mjs` checks the correct option against the real picture order using the number in each `pic-seq-<story>-<n>` file name, and set 17 builds its orders with helper functions (`order`, `lab`, `orderOptions`) so a new shuffle cannot produce a wrong answer key.
- Scratch paper (2026-10-04): the pencil button in the exam footer appears on an item when `item.subject === "math"` or `item.review.column` exists; set `scratch: true` / `scratch: false` on the item to force it on or off. Nothing else is needed when writing a normal sum: give it a `review.column` and it gets the button automatically.

