# Poklike

A free, independent, offline-first little playroom for children. 25 original creative activities inspired by publicly documented open-ended play mechanics; **not** affiliated with Pok Pok and **not** a copy of proprietary graphics, recordings, characters or code.

## Play

Open on a static HTTPS host. Wait for the **Ready offline** indicator before disconnecting, then install or add it to your home screen. All 25 activities are precached together before the indicator appears; opening them the first time does not require internet once ready. In Safari on iOS use **Share → Add to Home Screen**. On Android use the browser **Install app** or **Add to Home Screen** option. Local creations and preferences are only saved in browser storage, so clearing browser data removes them. Back up in **Grown-ups & settings** if needed.

## Full-screen play on phones

On Android and iPhone, every toy uses an immersive, full-height canvas instead of shrinking a landscape scene into a card. Explore the rest of the wide play world by **swiping the background** or pressing the edge arrows. **See all** provides an overview; **Fill screen** returns to the large interactive view. The top bar and tool tray are inset around notches and home indicators. Install the PWA using **Add to Home Screen** to hide browser chrome.

## Native Android and iPhone apps

The [native app source and build instructions](native/README.md) live under `native/`. These are React Native apps using native SVG elements and native-stack navigation—not WebView wrappers. Both Android and iOS JavaScript bundles and the shared camera/game-state tests pass in CI. Separate GitHub Actions workflows attempt a standalone Android APK and unsigned iPhone Simulator app; physical iPhone distribution requires Apple signing credentials. Native installations work without network access after the app binary is installed.

```sh
cd native
npm install
npm run check
npm start       # Expo Go / device pairing
npm run android # Android Studio emulator or connected Android device
npm run ios     # macOS / Xcode Simulator or connected iPhone
```

## Develop

No dependencies, accounts, hosted backend, tracking, API keys or build process. The shipped app consists of static HTML, JavaScript, CSS, icons and a service worker.

```sh
npm run serve          # Python 3 static server at http://localhost:8000
npm test               # Node.js 20+ toy mechanics unit tests
npm run test:browser   # Browser and offline E2E (Chromium + Python 3)
```

The browser test suite opens all 25 toys online and again with emulated network-offline, tests pointer drawing and storage persistence, adult protections, plus desktop/mobile screenshot and layout assertions. Automated browser testing must be run on an environment allowed to browse its own localhost (for example GitHub Actions). Generated `test-artifacts/` is ignored.

## Source-grounded scope

See [`replica/recon.md`](replica/recon.md), [`replica/features.csv`](replica/features.csv), [`replica/test-plan.md`](replica/test-plan.md) and [`replica/bugs.md`](replica/bugs.md) for evidence, behaviour-matching limits, tests and open parity items. Individual toy depths and movements are **not** claimed identical to the commercial app; compare against user-provided screen recordings before marking parity complete.

## Public distribution

The deployment workflow publishes static app assets from `main` to GitHub Pages at **https://overbit.github.io/poklike/** on each push to `main` (or by manual workflow dispatch). Unit and browser/offline checks run in a separate `Verify Poklike` workflow; review both workflow results before treating a release as verified. **One-time setup:** Open repository **Settings → Pages → Build and deployment → Source: GitHub Actions**. The workflow cannot create a Pages site until this option is selected; the GitHub Actions token lacks permission to create the site. Once configured, run **Actions → Deploy Poklike to GitHub Pages → Run workflow** (or push to `main`). The public GitHub Pages site is available to anyone when publishing succeeds. No backend is needed. Changing app assets requires updating the cache `VERSION` in `sw.js`; an update precaches the full bundle before replacing the previous version.
