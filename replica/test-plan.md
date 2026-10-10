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
