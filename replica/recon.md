# Poklike reconnaissance — 2026-10-10

## Scope and evidence
App concept: Pok Pok Montessori Playroom; clone only public *mechanics and UX flows* into an independently illustrated, offline, free progressive web application named Poklike.

| Source | Evidence |
| --- | --- |
| https://playpokpok.com/ | 25 toy names, broad themes, age range, low-stimulation positioning |
| https://play.google.com/store/apps/details?id=com.playpokpok.pokpok | Offline, ad-free activity selector, parent area, open-ended play |
| https://apps.apple.com/us/iphone/story/id1894953131 | Dress-up diversity, interactive Busy Book, slow Shapes, directional arrows Code Factory, Phonics letter/word interaction |
| https://www.commonsensemedia.org/app-reviews/pok-pok-playroom | Historical descriptions of Town, Busy Board, drawing, music and blocks |

## Screen inventory
- S01 Playroom: a gallery with 25 toy tiles; offline preparation/ready/error states, installed and non-installed contexts.
- S02–S26 Toy screens: one per toy listed in `features.csv`, interactive stage, optional tool shelf, reset and exit. Missing original imagery and exact toy depth need validation from user's recordings.
- S27 Adult gate: challenge; invalid-answer state.
- S28 Adult settings: sound, motion, export/import, explicit local reset.

## Flows
- F01 Browse gallery → choose a toy → freely explore → back to gallery.
- F02 Enter any toy directly/after reload → resume local state → reset that toy.
- F03 First full load → service worker asset installation → verify offline-ready signal → disconnect → reopen all toys.
- F04 Enter adult gate → solve question → modify settings or export/import/reset.
- F05 Install application from supported browser → open standalone → explore offline.

## Components
Playroom card, icon artwork, stage renderer, activity-specific touch tools, draggable vector, sound engine, state persistence, app/connection status, adult dialog.

## Inferred data model
All data is local, no remote database or user identifiers. `toy-state[id]` contains small serializable arrays, selections, control states and drawing paths (inferred). `preferences` includes sound and reduced motion. The browser owns local storage and app cache. Original persistence behaviour: unknown.

## Cannot clean-room reproduce
The source application's proprietary artwork, characters, sound recordings, proprietary music, branding and text; original paid subscription workflow is excluded by user choice 2B. Exact unobserved scenes/interaction depth remain unverified until user recordings are available. Our mechanics are original interpretations, not claims of 1:1 equivalence.

## Size
XL for verified feature parity across 25 independent creative toys. Screen count 28, flow count 5, remote DB count 0. High-risk parts: 25 independent interaction systems, cross-platform touch targets, atomic precaching and cache-update rollback.
