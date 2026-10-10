# Poklike

A free, independent, offline-first playroom for children. It contains 25 original interactive activity scenes inspired by publicly described, open-ended Pok Pok mechanics. This is not affiliated with Pok Pok and does **not** copy its proprietary graphics, animation, code, characters or sounds.

**Play:** https://overbit.github.io/poklike/

## Install on iPhone, Android and tablets

Open the site in Safari (iOS) or Chrome (Android), wait for **Ready offline**, then use **Add to Home Screen** / **Install app**. Once the service worker has downloaded every game file, all 25 toys open without internet. Local saves remain on this browser/device unless browser data is cleared or the OS evicts site storage. The adult-gated settings area provides backup export and restore.

## Mobile interaction

The portrait gameplay is **composed for the phone**, not a cropped landscape scene. The 25 original 480×840 toy compositions now live inside a responsive SVG world that expands horizontally or vertically to match the phone's actual play area: circles remain round, text is not stretched, and the entire artwork stays visible at 320px through tablet sizes. Use a finger to manipulate objects directly. Busy Board has independent multi-touch sliders, switches and meshing gears; Busy Book has illustrated discoveries and swipeable pages; Musical Blobs responds to moved shapes and collisions; Town has four tappable places and draggable neighbors; World Puzzle pieces snap to matching targets. Native-style safe area margins keep the back/restart controls clear of cutouts.

The game is **one installable PWA** for Android, iPhone and desktop; there are no separate native apps. Landscape companion scenes remain available when rotating the device.

This is an original interactive interpretation rather than a verified frame-perfect replica. In particular, the commercial toys contain deeper systems, artwork and sounds than these interpretations. See [replica/recon.md](replica/recon.md) and [replica/features.csv](replica/features.csv) for source evidence and unverified details. The two provided YouTube URLs could not be fetched here, so their specific contents are not claimed to have been reviewed.

## Develop and test

Requires Node.js 20+ and Python 3 for the static server. Chromium is needed for end-to-end tests.

```sh
npm run serve
npm test
npm run test:browser
```

There are no runtime package dependencies or CDN requests. The project has no Android/iOS native targets; the **installed web app** is the phone and tablet delivery format. A GitHub Actions verification workflow checks all 25 toys online and offline, their responsive portrait layouts, and touch interaction. The Pages workflow publishes the verified static assets from `main` (its own HTTPS asset check runs after deployment).

The browser tests run best in GitHub Actions: a managed local browser may block requests to `127.0.0.1`. Changes to the offline asset list require incrementing `VERSION` in `sw.js` and updating the expected cache name in tests.
