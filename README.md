# Poklike

A free, independent, offline-first playroom for children. It contains 25 original interactive activity scenes inspired by publicly described, open-ended Pok Pok mechanics. This is not affiliated with Pok Pok and does **not** copy its proprietary graphics, animation, code, characters or sounds.

**Play:** https://overbit.github.io/poklike/

## Install on iPhone, Android and tablets

Open the site in Safari (iOS) or Chrome (Android), wait for **Ready offline**, then use **Add to Home Screen** / **Install app**. Once the service worker has downloaded every game file, all 25 toys open without internet. Local saves remain on this browser/device unless browser data is cleared or the OS evicts site storage. The adult-gated settings area provides backup export and restore.

## Mobile interaction

The portrait gameplay is **composed for the phone**, not a cropped 960x600 landscape page. Each of the 25 activities has a 480x840 SVG portrait scene with its own controls. Tap or drag the pieces inside each toy, use your finger to draw, experiment with Busy Board's sliding controls, and combine the musical shapes. The only persistent screen-level buttons are home and restart. Wide layouts are still available when rotating the device.

This is an original interactive interpretation rather than a verified frame-perfect replica. In particular, the original Busy Board, Town and Busy Book have much deeper behavior than the present implementation. See [replica/recon.md](replica/recon.md) and [replica/features.csv](replica/features.csv) for source evidence and unverified details. The two provided YouTube URLs could not be fetched here, so their specific contents are not claimed to have been reviewed.

## Develop and test

Requires Node.js 20+ and Python 3 for the static server. Chromium is needed for end-to-end tests.

```sh
npm run serve
npm test
npm run test:browser
```

There are no runtime package dependencies or CDN requests. The project has no Android/iOS native targets; the **installed web app** is the phone and tablet delivery format. A GitHub Actions verification workflow checks all 25 toys online and offline, their responsive portrait layouts, and touch interaction. The Pages workflow publishes the verified static assets from `main` (its own HTTPS asset check runs after deployment).

The browser tests run best in GitHub Actions: a managed local browser may block requests to `127.0.0.1`. Changes to the offline asset list require incrementing `VERSION` in `sw.js` and updating the expected cache name in tests.
