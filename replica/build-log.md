# Build log — 2026-10-10

All 25 distinct toy scenes are implemented with native SVG pointer/click mechanics, local state and synthetic audio. This is original interpretation from publicly documented themes, not confirmed 1:1 parity.

- 02 Code Factory: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 03 Cooking: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 04 Phonics: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 05 Pawn Maker: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 06 Geometry: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 07 Space: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 08 Number Journey: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 09 Shapes: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 10 Dress-Up: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 11 Dinosaurs: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 12 World Puzzle: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 13 Radio: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 14 Islands: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 15 Connect The Dots: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 16 Marble Machine: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 17 Shops: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 18 Sequencer: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 19 Forest: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 20 House: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 21 Silly Blocks: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 22 Town: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 23 Drawing: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 24 Busy Board: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 25 Musical Blobs: **partial** — unit tested; awaiting live browser test and supplied original recordings.
- 26 Busy Book: **partial** — unit tested; awaiting live browser test and supplied original recordings.

Shell: PWA install, full-cache service worker verification, offline deep-link reopens, adult local controls and saved progress implemented; cross-platform verification pending.

2026-10-10 | S02-S26 | responsive portrait renderer introduced for all 25, with direct stage actions instead of cropped landscape camera. Busy Board dial + slider input, Musical Blobs collision feedback, portrait drawing model coordinate mapping. Original-video parity remains partial, pending user recordings. Tests: Node unit + Chromium offline/responsive in GitHub Actions; physical-device check outstanding.
2026-10-10 | Deepened Cooking guest/table and kitchen states, Code Factory continuous loop/director/crates/cleanup, and Phonics draggable grapheme slots from official gameplay descriptions. Broader scene depth still partial and video frames unverified.
2026-10-10 | Added wide companion art for Cooking, Code Factory and Phonics to avoid regressing to old placeholder mechanics after rotation. UI now reserves iOS safe-area edges for portrait stage.

2026-10-10 | Responsive gameplay iteration | Added an aspect-preserving scene world across all 25 portrait toys, removed ellipse deformation, and fixed touch drag persistence including puzzle snap positions. 
2026-10-10 | Busy Board / Busy Book | Meshing gears, powered indicator, independently operable sliders, illustrated book discoveries, reversible touch changes and swipe/keyboard page turns. **Partial** against commercial reference.
2026-10-10 | Musical Blobs / Town | Four distinct playable instrument shapes with collision chords and four large touchable town venues with draggable visitors. **Partial** against commercial reference.
2026-10-10 | Source limitation | V01/V02 YouTube frames unavailable to the execution environment; exact footage matching not asserted. Android/iOS real-hardware checks still pending.

2026-10-10 | Batched browser visual QA | Reviewed screenshots of 390×844 portrait Cooking/Busy Board/Busy Book/Town/Puzzle, landscape Cooking, and the collection. Addressed blank featured Drawing gallery preview and World Puzzle tray/control overlap with original illustrative art. Screenshot evidence comes from Chromium device emulation, not real iOS/Android hardware.
