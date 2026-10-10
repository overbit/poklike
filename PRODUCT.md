# Poklike product

## Platform
web

## Stack
Zero-dependency, offline-first progressive web app served statically from GitHub Pages. Source-rendered SVG play objects with local state. No native Android/iOS apps or native build targets.

## Audience
Children around 2-8 and their caregivers, on iPhone, Android, tablets and desktop. First play should require no instructions, and all game controls should be reachable with one or more fingers.

## Product goal
An independent, free, calm creative playroom inspired by the **observable mechanics** of Pok Pok. It is not Pok Pok and does not use its proprietary art, recordings, code, character art, text or branding.

## Non-negotiable behavior
- All 25 toys playable after an initial complete download and service-worker cache verification.
- On portrait phone and tablet, each toy has a **purpose-composed portrait scene** (480x840 logical units) instead of a cropped 960x600 landscape world.
- Landscape and desktop retain interactive wide worlds. Cooking, Code Factory and Phonics have bespoke wide scenes too; no toy depends on a camera arrow.
- Primary play is through direct tapping, drawing, dragging, sliders and exploratory actions inside the scene; no bottom toolbar covering the play area in portrait.
- Adult-only gate for device sound/motion and reset/export/import; no analytics, accounts, ads, subscriptions or server.
- Semantic atomic commits, conventional PR titles and automated browser tests, including service-worker offline reopening.
- An externally viewable video URL does **not** count as verified gameplay until its frames and timestamps have actually been inspected.

## Reference confidence
Official catalogue and feature descriptions: high confidence for toy names and themes. Apple Design interview and independent reviews: medium-high for core interaction patterns. The two supplied YouTube links could not be opened in this environment (2026-10-10); no frame-by-frame observations have been claimed. Exact toy depth and visuals remain a source-grounded parity gap until clips are available as uploaded recordings.
