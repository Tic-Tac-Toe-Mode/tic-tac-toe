# Android Studio release checklist

The Android project is included in `android/`. The application identifier was corrected because its previous final segment started with a number and Capacitor refused to create the project. If you already have a Play listing, verify that its package name matches before release; published package names cannot be changed.

## Build locally

1. Download the latest repository code. Install Node 22, Android Studio, JDK 21, and Android SDK 35.
2. Run `npm ci`.
3. Run `npm run build` then `npx cap sync android` after every code update.
4. Run `npx cap open android` and select JDK 21 for Gradle.
5. Connect a phone with USB debugging and run the app.
6. For device testing use Build APK(s). For Google Play use Generate Signed Bundle / APK → Android App Bundle. Keep the signing key private and backed up.

The AdMob application ID is configured inside the Android manifest, not merely in JavaScript comments. Release builds load bundled assets and do not depend on the old preview website.

## Remaining release blockers

- The rewarded placement currently uses an interstitial unit ID. Create a genuine rewarded unit before testing rewards; the formats are not interchangeable. Interstitial dismissal does not prove reward eligibility. Use Google's test ad units or registered test devices, never click live ads during testing.
- Review ad consent requirements and privacy options for the regions you serve before requesting ads.
- The privacy pages contain an unverified support address and data/security claims. Replace them with your actual contact and retention practices, publish a reachable privacy URL, and complete accurate Data Safety and Contains Ads declarations.
- Public multiplayer/chat permissions, moderation/reporting/blocking and deletion handling need a security/compliance review before public release.
- Check current Play target API requirements at submission time; the generated project targets API 35 and may need an upgrade for your submission date.
- Android compilation and physical-device ads cannot be verified in this sandbox because it has no Android SDK or Java runtime.

Read the native mobile guide: https://docs.lovable.dev/tips-tricks/mobile-development