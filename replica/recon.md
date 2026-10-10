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

## Gameplay-focused recon update (2026-10-10)

### User-provided videos: source status

| ID | Reference | Status / verified observations |
| --- | --- | --- |
| V01 | https://www.youtube.com/watch?v=_eU28IGSi0M | **Not inspected**: YouTube fetch is blocked in this execution environment; no frames, audio or transcript available. |
| V02 | https://www.youtube.com/watch?v=eCYRBnBDSrU&t=19s | **Not inspected**: YouTube fetch is blocked; the 19s timestamp is provided by user, not a verified observation. |

### Verified public source observations, not from V01/V02

| ID | Source | Observable gameplay patterns |
| --- | --- | --- |
| P01 | https://9to5mac.com/2021/05/20/hands-on-with-pok-pok-playroom-kids-app/ | Toys generally show a single small home control and few textual menus. Town: school, farm, library, vehicles and people. Busy Board: levers, switches, knobs, wheels, gears and multi-touch. Busy Book: browsable illustrations and tappable objects, swipe and shortcut navigation. |
| P02 | https://developer.apple.com/news/?id=5bcex7xf | Musical Blobs: abstract shapes interact, blue represents C pitch and circles are simple sine-wave tones. Sound design prioritizes quiet, repeatable feedback. |
| P03 | https://playpokpok.com/blog/busy-board-expansion-is-here-662e737e59d7/ | Busy Board includes one- and two-handed mechanisms; child-triggered sound, magnetism/electricity/gravity concepts. |
| P04 | https://playpokpok.com/blog/new-toy-dress-up/ | Dress-Up cycles body types and features, scroll/tap clothing and hair categories, and allows free experimentation. |
| P05 | https://www.commonsensemedia.org/app-reviews/pok-pok-playroom | Direct tap/swipe/drag, creative drawing, collision music, interactive town and gadgets. |

### Key mismatch that triggered this refactor

The previous prototype scaled a 960x600 scene into small phone widths or cropped it and added navigation arrows, while hiding play objects and leaving most interactions in a bottom toolbar. On the 390x844 capture, the Cooking bowl occupied nearly the entire viewport while ingredients were off-screen. This was a reproduced UI defect, not an evidence-based recreation of Pok Pok.

### Mobile interaction spec

- **F06 Phone portrait:** gallery -> any toy -> 480x840 purpose-composed activity -> direct touch action -> persisted result. Check all 25 with real tap targets and no hidden scene objects.
- **F07 Rotation:** landscape toy -> rotate portrait -> portrait game scene, same underlying play state -> rotate back. No resets, lost creations or unreachable controls.
- **F08 Multi-pointer:** in Busy Board two fingers can control separate mechanisms without one pointer stealing the other.
- **F09 Musical collision:** drag a shape onto another -> state change and gentle musical feedback.

Screens S02-S26 now have explicit mobile portrait compositions, but video-verified per-toy depth remains **partial**, not equivalent. Source video frames must be supplied before a truthful frame-by-frame diff is possible.


### Newly verified gameplay details, not from the inaccessible videos

| Reference | Observable gameplay detail | Our implementation |
| --- | --- | --- |
| https://playpokpok.com/blog/new-toy-cooking/ | Cooking starts with dinner guests and their cravings, then permits multiple kitchen procedures (sink, stove, blender, oven), serving and cleanup. | Guest selection, cravings, serving and kitchen/sink/heat/ingredients/stir are interactive. Blender/oven/cleaning and expanded guest variety are **not** replicated yet. |
| https://playpokpok.com/blog/new-toy-code-factory/ | Factory constantly moves, workers follow routes, director buttons change outcomes, crates turn into goods, messes can be cleaned, and finished products reach the market. | Continuous conveyor/worker loop, changeable director buttons, crate production, market goods, cleanup. Simplified outcomes and animations. |
| https://playpokpok.com/blog/new-toy-phonics/ | Players drag grapheme units into Elkonin boxes, hear phonemes and blended sequences, and build full words. | Movable letter chunks with three sound slots, word progress and reset. No verified recorded phoneme/voice assets; spoken sounds are not yet equivalent. |
| https://playpokpok.com/blog/new-toy-geometry/ | Drag shapes from sidebar, rotate with taps, discard via black hole bin. | Draggable shape collection; exact rotation/discard and composition variety remain open. |

The status of V01/V02 remains **uninspected**. These additional facts are sourced from official text, not claims about those particular video frames.


## Responsive gameplay verification notes (2026-10-10, follow-up)

- The user prioritized the installable web app; all native projects and build workflows have already been removed from this repository.
- V01 and V02 YouTube links remain **uninspected** because remote YouTube playback/frames/transcripts were unavailable to the research environment. We did not assert gameplay details sourced from them.
- Current redesign uses original art based on verified public descriptions (P01–P05). Added touchable scenes for Busy Board, Busy Book, Town and Musical Blobs; these are independent mechanics, **not** claims of exact visual parity.
- Portrait now computes a viewBox from the *rendered stage's* width/height rather than stretching a fixed 480×840 scene. This preserves geometry for 320×568, 390×844, 412×915, 768×1024 and other sizes.
- Model-coordinate offsets for draggable portrait objects are reversed on save; World Puzzle portrait targets now coincide with its authoritative model snap coordinates. Gesture and offline tests track regressions.
- The remaining largest uncertainty is 1:1 toy depth and artistic quality versus the original, which requires first-party recording frames or observable walkthroughs.
