# Architecture

Use existing Vite/ES Modules conventions. Implement independent modules without building a general-purpose framework.

## Boundaries and Proposed Files

| Responsibility | Target |
| --- | --- |
| Game lifecycle/state machine | src/core/router.js, state.js |
| Question validation/selection/exam projection | src/core/content-validator.js, exam-question.js; src/content/* |
| Thai voice arbitration | src/core/audio.js |
| Exam UI, no correctness access | src/exam/* |
| Review/teaching and fixed arithmetic | src/review/column-steps.js, column-renderer.js, review-view.js |
| Progress/events and summary | src/progress/*, src/screens/parent.js |
| Completion rewards | src/rewards/* |
| Buddy/theme/accessibility | src/styles.css and presentation components |

File names are proposals. Inspect existing code and preserve its useful helpers. No runtime imports from the original repository.

## State Machine

home -> intro/buddy selection -> exam(block 0) -> submit-confirm
-> review(submitted block) -> optional transfer -> review
-> break -> exam(next block)
After final block: review -> reward -> home.

Partition selected question IDs into blocks of at most five. A 12-question session is 5+5+2; derive final-block status rather than hard-coding question 12. Submission requires each item answered or explicitly marked not sure. Allow correction within the current block before submission, not after.

State transitions use a pure reducer with explicit guards. Review cannot address unsubmitted/future blocks. Navigation creates an AbortSignal and disposes previous listeners, speech, animation callbacks and timers.

## Persistence Contract

Store under little-exam-adventure-v1; never migrate or clear lilly-world-v1.
Persist a versioned envelope including:
- settings: sound, speech rate, buddy, plain/buddy mode.
- active session ID, content pack version, selected IDs, stable option order, seed, phase and cursors.
- initial selection events, current draft answers and immutable submitted answer snapshots per block.
- submittedAt per block; review cursor/step, completed/skipped activities and transfer attempts.
- replay events by role, hint requests, teaching exposure by skill/family.
- reward transaction/claimed state and completed session summaries.

Commit each user action atomically in one state write; avoid persisting answer without the matching cursor/phase. At submission freeze answers before transitioning to review. Reward granting and ownership changes must be one idempotent update keyed by session ID.

Validate loaded data and handle malformed saves/storage failure without deleting unrelated keys. Keep data minimal, local and bounded. Warn parent on storage failure instead of falsely promising resume. Resume uses the saved content version; missing/incompatible content should offer safe restart with old summary preserved, never silently remap answers.

## Exam Boundary

toExamQuestion() must explicitly allow-list prompt, task visuals, neutral option representations and speech references. Do not spread nested authoring options: strip review/result/correctness recursively through deliberate projections.

Do not send correctOptionId, explanation, arithmetic result or solution metadata to exam components. The buddy receives lifecycle/effort events, never correctness.

Inspect visible content, DOM attributes, accessibility labels, hidden DOM and serialized view state. This is an accidental UX leak boundary, not cryptographic security: a static app's downloaded question data is not protected against DevTools.

## Audio Contract

One playback owner across prompt, option, hint, explanation and encouragement.
- unlockFromGesture(), play(request), replayCurrent(), stop(), setRate().
- play returns completion/cancel/error, not an indistinguishable resolved Promise.
- New explicit play cancels the previous request globally, including TTS and Web Audio.
- Generation/session token rejects stale callbacks; AbortSignal handles navigation.
- Automatic flow awaits successful completion; error offers retry/manual recovery, never silently advances.
- Replay and manual pause/exit stay reachable; no control deadlock during loading/failure.
- Prompt autoplay begins only after gesture unlock. Visible retry handles blocked autoplay.
- Recorded playback does not depend on speechSynthesis existing.
- Replay analytics exclude first autoplay; option listening does not trigger selection.
- Buddy audio never interrupts a prompt; no background speech queue that fires on a later screen.

## Review Arithmetic

Extract/adapt pure buildColumnSteps({op, a, b}) from original column.js into this repo. Keep renderer, speech and animations separate from step computation. Use authored fixed operands, not the original random practice progression.

Only review mounts the teaching renderer. Record hint/step usage without changing submitted answers. Correctly answered items can use the same teaching tools.

## Presentation

Keep the question area plain and high contrast, with a calm scene outside it. Reserve stable corner space for a still/silent buddy during exam. Plain mode removes decoration; reduced motion suppresses animation. Touch targets >=48px, Thai marks unclipped, stable diagram sizing and no overlap at 320px through desktop.

Prevent accidental text selection/image dragging on interactive play surfaces, not blanket disabling browser accessibility zoom. Parent controls use explicit confirmation; no required press-and-hold interaction.

## Expansion

Add adaptive selection and full parent dashboard on persisted skill events. Add offline only with a new cache name/scope and manifest coverage; do not claim offline works in the slice until tested. New content packs should not require engine changes.
