# Verified bugs

Only reproducible defects go here. Unverified compatibility and exact Pok Pok scene parity are tracked in `test-plan.md` and `features.csv`, not mislabeled as passed.

None recorded yet.

## Mobile world cropping (S2; fixed in responsive refactor)

- Reproduced in the preceding 390x844 Cooking browser screenshot: bowl fills the screen, ingredient controls appear offscreen, persistent camera arrows and a bottom toolbar obstruct play.
- Expected: important objects and tappable ingredients visible on portrait phones without a camera pan.
- Fix: replace cropped 960x600 viewBox with an individual 480x840 layout for every toy; control hit regions and drawing/drag transforms adapt to portrait. Verification covered by F06-H1 and F06-H3; browser/real-device validation tracked separately.

## Portrait Marble Machine jumps off the track (S2; fixed)

- Reproduced on main: `portrait-toys.js` positioned the ball with a separate horizontal counter and an alternating y=214/253 rule, not the drawn rail.
- Expected: the ball rolls continuously along the visible serpentine track; pause holds its current position and resume continues.
- Fix: use one curved centerline to draw both rails and sample the ball position; advance with a portrait animation frame loop instead of remounting the SVG every 350 ms. A rolling highlight turns, and the exiting ball fades before a new one enters. Landscape is unchanged.
- Regression: a deterministic geometry continuity unit test and real Chromium checks at 390x844 for rail proximity, motion, pause and resume. Real iPhone/Android validation remains outstanding.
