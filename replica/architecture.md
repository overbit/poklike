# Architecture

No hosted backend, authenticated accounts, remote dependencies, build step or external APIs. HTTPS static serving (or localhost while developing) is required for service worker registration. `index.html`, `styles.css`, `app.js`, `toys.js`, the manifest and icon are cached atomically on the initial install and versioned on updates.

`app.js` owns navigation, delegated pointer/click/keyboard events, sound, local storage, adult gate, online/offline indicators and service worker readiness. `toys.js` is a pure toy catalogue, scenes, state transitions and simulation ticks. Every scene is built from independently authored SVG geometry; audio is synthesized through Web Audio. No runtime font or media requests.

Persistent browser state is validated and bounded when loaded. The cache is separate from saved creations. No analytics, cookies, requests to child-data endpoints or personal data. URL hash deep links are local only. Keyboard/ARIA controls and alternate toolbar actions are provided for games whose main input is pointer-heavy.

Build sequence: docs/recon → offline app shell/interactive stage → 25 toy interactions → adult gate/persistence → browser and offline test harness.
