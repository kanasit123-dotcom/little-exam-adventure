# Test Plan

Tests below are acceptance work for the NEXT implementation, not evidence already passed. Old scaffold tests must be updated to the approved scope.

## Unit and Content

- Six subject IDs; slice 12 main items, two per subject; future packs not capped at 12.
- Valid provenance/review/asset/audio references; unique questions/options and valid answer.
- 10, 12, 15 question partition -> 5+5, 5+5+2, 5+5+5.
- Selection/order stable after reload, no duplicate items in a session.
- Explicit exam projection removes nested answer/review/result metadata.
- Reducer rejects review of future blocks and changes to submitted answers.
- Draft, initial selection and submitted snapshots have distinct semantics.
- Transfer results cannot overwrite first submitted answers; exposure tagged after teaching.
- State normalization, version mismatch, corrupt save and storage failure handled.
- Reward grant idempotent on repeated click/reload.
- Fixed column fixtures 8+7=15 and 12-5=7 include correct carry/borrow steps and alignment.
- Recorded audio works without speechSynthesis; manifest coverage checked.
- Global audio stop/replay and stale completion callbacks tested with deterministic fakes.

## End-to-End Flows

1. Start with buddy, finish 5+5+2 with review and optional breaks, claim reward.
2. No feedback after each choice; no review access before submitting that block.
3. Listen to each option without changing answer; replay unlimited without score penalties.
4. Change draft choice, go back within block, reload; selection/order stay unchanged.
5. Resume exam, submission confirmation, review step, transfer, break and reward.
6. Submit includes answered/not-sure items, rejects unvisited items, then freezes answers.
7. Inspect exam DOM, accessibility labels and view state for correctness/helper leakage.
8. Compare correct and incorrect choices: same pre-submit buddy animation/audio/timing.
9. Review every submitted item, including those answered correctly; skip optional teaching.
10. Step through carry/borrow; listen/replay; transfer response remains separate in parent summary.
11. Rapid replay, option audio, next/back and unmount: one voice only, no stale navigation.
12. Failed/blocked audio can recover; no permanent disabled controls or auto-skip.
13. Skip break and transfer, still receive completion reward once regardless of score.
14. Parent summary shows unknown/incorrect separately, replay/hints and teaching exposure.
15. Plain/buddy mode, sound setting and reduced motion persist.

Test with all-correct, all-incorrect, not-sure and mixed sessions. Do not infer comprehension from replay count alone.

## Visual and Touch Matrix

320x568, 390x664, 768x1024, 1024x768, 1280x900.
Capture exam, visual/spatial question, review arithmetic, break, reward and parent screens.

Verify:
- No overflow/overlap; buddy never covers controls or essential diagrams.
- Stable answer/diagram geometry; selection doesn't move targets.
- Thai combining marks and long labels fit, including slower audio states.
- >=48px touch targets; option audio button independent of selection.
- Images actually render, correct transparency/framing, no broken assets.
- No illustration, pointer, gaze or alternative text inadvertently supplies an answer.
- Normal play doesn't trigger text selection, image drag or callout.
- Browser accessibility zoom remains usable.

## Real iPad Gate

Run Safari on a physical iPad; Chromium touch/viewport emulation is not equivalent.
- First gesture unlock, main prompt/option/review sound audible.
- Fast repeated replay never overlaps or leaves silence permanently.
- Switch app, lock/unlock, rotate and resume; next gesture restores suspended audio.
- Check narration clarity, vowel sounds, number/operator pronunciation and slower speed.
- No unwanted advance before narration ends.
- Touch selection/scroll is ergonomic in both orientations.
- Record device, OS/browser version, date and observed results.

If hardware/access is unavailable, report pending real-device QA; don't mark release-ready.

## Expansion-Only Tests

When implemented: offline restart/content/audio after cache warmup, cache update/migration, independent SW scope, 36-item library selection, adaptive revisit without duplicate baseline/transfer, full dashboard and garden.

Offline/PWA tests are not slice claims before these features exist.

## Source Protection and Reporting

Capture original git status before/after; preserve any pre-existing user changes. Never reset to make status clean. Run relevant original regression only if reuse investigation requires it, without altering source code.

Report exact commands/results for npm run check and npm run test:e2e, screenshots, manual listening/content signoff, remaining defects and gates not run. Mocked audio success does not prove audible playback.
