# Test plan

## Automated unit coverage
- U01 all 25 toy routes have distinct substantial interactive scenes and metadata.
- U02 every toy can accept an action without throwing.
- U03 drawing undo, movement persistence, puzzle snapping, beat scheduling, factory/marble toggles.

## Browser flow coverage
- F01-H1 open each of the 25 toys, activate a toy-specific control, return home.
- F02-H1 draw by pointer, reload and verify a saved stroke; reset clears current activity without affecting others.
- F03-H1 first load, wait for verified cache complete, disconnect network via DevTools, reload and open all 25 routes.
- F03-N1 start without a service worker (insecure context) never falsely claims offline-ready.
- F03-E1 remove offline asset before install: service worker install should reject and old version remain active (needs deployed upgrade testing).
- F04-H1 enter adult gate, reject incorrect answer, accept correct answer, change preferences, export/import local backup, reset all.
- F05-H1 manifest display/name/icons validated; actual home screen install requires physical-device confirmation.

## Cross-device checks
- Desktop 1280×900 and mobile 390×844 screenshots, no horizontal overflow.
- Pointer movement on touch simulation; keyboard-only stage actions; visible SVG role/ARIA labels.
- No page exceptions or failed first-party requests during interaction.

## Manual signoff still required
Install/Add to Home Screen on a physical iPhone/iPad and Android tablet; test physical pinch/drag gestures, silent mode and browser storage eviction; compare toys against user recordings for depth/scene fidelity.

## Responsive/PWA regression plan (2026-10-10)

- F06-H1: For each of 25 activities at 390x844, stage fills >=98% viewport height, uses portrait viewBox 480x840, provides an in-bounds tappable/draggable target, and has no global toolbar over the scene.
- F06-H2: At 320x568 and 412x915, content fits without horizontal overflow or hidden persistent navigation buttons.
- F06-H3: Cooking ingredient tap changes the stored recipe without separate bottom controls.
- F07-H1: Change viewport from phone portrait to landscape while inside a toy, assert wide viewBox and retained state; rotate back, verify portrait restored.
- F08-H1: Busy Board dials respond and two sliders can be moved independently with two pointer IDs.
- F09-H1: Musical Blobs update collision count when objects overlap; drawing pointer strokes persist after reload.
- F03-H1: With offline network emulation after confirmed asset cache, reload gallery and open all 25 activities. Cache should contain portrait-toys.js.
- Manual M01/M02: Real Safari Add to Home Screen on iPhone; Android Chrome install; verify safe areas, 2-finger sliders, landscape, screen reader, storage under OS memory pressure.
- Manual M03: Upload V01/V02 video files; timestamp and describe each toy scene before calling replica parity verified.
