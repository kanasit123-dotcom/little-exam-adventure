# AI Handoff: Lily Exam Adventure

## Read First

1. [PROJECT-PLAN.md](PROJECT-PLAN.md): approved product scope and delivery phases.
2. [AUDIT-GAME-LILLY.md](AUDIT-GAME-LILLY.md): read-only source audit and reuse constraints.
3. [Decisions](docs/DECISIONS.md), [Architecture](docs/ARCHITECTURE.md).
4. [Content](docs/CONTENT-SPEC.md), [Assets](docs/ASSET-MIGRATION.md), [Tests](docs/TEST-PLAN.md).

The user's latest pasted specification and approved plan supersede the earlier draft. The missing attachment named Lily_Exam_Game_Work_Handoff.md is NOT a blocker.

## Current State, Not a Completion Claim

- New working directory: C:\Users\KANASIT\Documents\Codex\little-exam-adventure
- Product name: Lily Exam Adventure. Keep folder/package name unless necessary.
- Local Git initialized on main, no commits or remote as checked 2026-09-25.
- Existing Vite/ES Modules scaffold includes provisional content, validator, tests, CI and six copied assets.
- Code/content still implement an OLD prototype specification: Thai 4, English 4, math 4. This is NOT the approved content distribution.
- Existing tests only prove scaffold behavior, not a working exam/review game.
- This handoff update changes Markdown only. Do not assume audio, full exam, review, dashboard or rewards are implemented.

## Next AI Assignment

When asked to implement, inspect current code first and develop the full 12-question vertical slice in this repository.

1. Verify source paths/revision and read the audit. If the source is no longer accessible, ask for access or its GitHub repository before assuming reuse.
2. Record research provenance and create original, reviewed content for six subjects: math, Thai, reasoning, spatial, science, general knowledge.
3. Replace stale content/test assumptions. Slice = 12 main questions, two per subject; target library = 24 main + 12 transfer.
4. Implement state machine for blocks 5+5+2: exam -> submit block -> review -> optional break -> next block; final review -> reward.
5. Implement independent persistence, audio arbitration/unlock, exam DTO boundary and lifecycle cleanup.
6. Build one question end to end as an internal milestone, then complete all 12. There is no mandatory one-question approval stop in this plan.
7. Adapt source column arithmetic to fixed-problem review only. Test 8+7 and 12-5 including carry/borrow.
8. Add calm scene/buddy, review teaching, transfer attempts, completion rewards and minimal parent summary.
9. Run tests and inspect desktop/mobile screenshots. Test audio on real iPad or explicitly report that gate as pending.
10. Report changed files, results, remaining gaps and original-repo status.

Do not build a replacement game from scratch or recreate working arithmetic algorithms unnecessarily. Copy/adapt narrowly into this independent repository.

## Non-Negotiable Constraints

- Original source is read-only: C:\Users\KANASIT\Documents\Codex\game-lilly
- Audited source commit: 61c97c1a8b0519a17849fccf985a706a6bd36a26
- No sibling-runtime imports, shared storage keys, shared Service Worker caches or progress migration.
- No timer; pause/resume every phase.
- No hints, scratchpad, answer feedback or correctness-dependent buddy behavior during exam.
- Replay prompt and individual options without limits or penalties. Listening to an option must not select it.
- Review only submitted blocks; don't overwrite original answers with learned answers.
- One voice at a time across all roles. Explicit replay cancels old speech; automatic flow waits for completion.
- Calm buddy stays still/silent while listening or thinking. More animation belongs in review/break/rewards.
- No claim that authored questions are verified past Satit Kaset exams.
- Rewards are completion-based, idempotent, and independent of score/replay/hint count.
- No publishing, remote push or change to original repo without applicable user authorization.

## Expected File Touches

See PROJECT-PLAN.md for phase mapping. Inspect before creating paths:
- src/content/* and core/content-validator.js: six-subject schema and session selection.
- src/core/*: state, routing, audio, exam projection.
- src/exam/* and src/review/*: separate rendering and fixed arithmetic.
- src/progress/*, src/rewards/*, src/screens/*: analytics, summary, rewards.
- src/main.js and src/styles.css: application composition and responsive presentation.
- tests/* and asset manifests: regression and voice/content coverage.
- docs/RESEARCH.md: source register to create during research.

## Commands

Use the existing lockfile and scripts; do not gratuitously upgrade dependencies.

~~~bash
npm ci
npm run check
npm run test:e2e
npm run dev
~~~

Inspect Vite config for the URL. If its port is occupied, select another port without terminating unrelated servers. Start and share a usable dev URL when implementation is ready.

## Git Handoff

No GitHub repository has been created by this documentation task. Inspect git status before any edits, preserve all pre-existing changes, use a codex/ branch for implementation unless instructed otherwise, and do not imply package private:true controls GitHub visibility. Confirm destination/visibility before creating a remote. A future commit/push should follow the user's instructions, not happen just because this file lists Git steps.

## Delivery Evidence

- Exact automated test commands/results, not merely “tested”.
- Screenshots at compact phone, iPad portrait/landscape and desktop sizes.
- Real Safari/iPad voice results distinguished from Chromium emulation.
- Research/content/recorded-voice review status.
- Known gaps, especially offline, real-device QA and unreviewed media.
- Confirm no changes to original game; do not reset anything to force a clean status.
