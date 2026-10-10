# Poklike for Android and iOS

This is a **React Native / Expo application**, not a WebView or a shortcut to GitHub Pages. It renders the shared original 25-toy SVG scenes with **react-native-svg native elements** and uses the same `toys.js` play mechanics as the PWA.

## Fullscreen games

Every toy fills the viewport in portrait and landscape. In portrait mode, the world is zoomed to the device height and can be moved with the Left / Right controls. Tap **See all** to view the complete world, or **Fill screen** to return to immersive play. The safe areas are reserved for large native buttons, and native-stack navigation handles Android Back and iOS back-swipe.

## Development

Requirements: Node 22+, Android Studio (for Android) or macOS + Xcode 26+ (for iOS).

```bash
cd native
npm install
npx expo install --check
npm run check
npm start
```

Open the QR code in an SDK-compatible Expo Go app, or run `npm run android` / `npm run ios` with your connected device/emulator. All 25 toys and the tone are **bundled into the native binary**, so the installed app has no runtime network dependency. Local creations and preferences are stored with AsyncStorage; grown-ups can share and import JSON backups.

The CI workflow verifies the shared state/gesture code and exports Android and iOS JavaScript bundles. **JavaScript bundle exports are not the same as signed APK/IPA builds or on-device gesture tests.** Test on real Android and iOS phones before release, especially dragging, iOS home indicator, Android system Back, sound and audio interruptions.

## Building installable binaries

For Android APK and iOS IPA, configure an [Expo EAS](https://docs.expo.dev/build/introduction/) account and application signing:

```bash
cd native
npx eas-cli login
npx eas-cli build:configure
npx eas-cli build --platform android --profile preview
npx eas-cli build --platform ios --profile preview
```

The iOS build requires your Apple signing credentials/provisioning; a public App Store release also requires Apple Developer Program membership. The Android Play Store release requires a signed Android App Bundle. No store publication occurs automatically.

The native app currently shares the original SVG toy implementation and gameplay rules with the PWA. Exact parity with the commercial Pok Pok application is not claimed without user-provided reference recordings.
