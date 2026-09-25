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
