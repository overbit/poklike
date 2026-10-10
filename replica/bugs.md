# Verified bugs

Only reproducible defects go here. Unverified compatibility and exact Pok Pok scene parity are tracked in `test-plan.md` and `features.csv`, not mislabeled as passed.

None recorded yet.

## Mobile world cropping (S2; fixed in responsive refactor)

- Reproduced in the preceding 390x844 Cooking browser screenshot: bowl fills the screen, ingredient controls appear offscreen, persistent camera arrows and a bottom toolbar obstruct play.
- Expected: important objects and tappable ingredients visible on portrait phones without a camera pan.
- Fix: replace cropped 960x600 viewBox with an individual 480x840 layout for every toy; control hit regions and drawing/drag transforms adapt to portrait. Verification covered by F06-H1 and F06-H3; browser/real-device validation tracked separately.
