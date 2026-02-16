# Handover to Claude: Debugging "Today's Manna" React Native App

## 🚨 Current Critical Issue

The user is experiencing a **persistent build error** that prevents the app from launching on Android (`npx expo run:android`).

### Error Messages

1. `SyntaxError: Closing parenthesis expected at end of if condition` (at a high line number in the bundle).
2. `Error: Invalid UTF-8 continuation byte` (suggesting file encoding corruption).

## 🛠️ Actions Taken by Gemini (Previous Agent)

I have performed the following actions to resolve these issues, but they persist:

1. **Mass Rewrite of Source Files to UTF-8:**
   I rewrote the following files (using `write_to_file`) to strictly enforce valid UTF-8 encoding and remove any potential invisible characters or corrupted bytes:
   - `App.tsx` (Main entry)
   - `components/VerseScreen.tsx`
   - `components/StartScreen.tsx`
   - `components/DetailScreen.tsx`
   - `components/Mascot.tsx`
   - `components/CalendarModal.tsx`
   - `components/BackgroundDecor.tsx`
   - `components/LoginScreen.tsx`
   - `components/ErrorBoundary.tsx`
   - `services/favoritesService.ts`
   - `constants/constants.ts`
   - `babel.config.js`
   - `metro.config.js`

2. **Cache Clearing:**
   Instructed the user to run `npx expo start -c` multiple times.

3. **Syntax Checks:**
   Verified `if` conditions and parenthesis balance in all rewritten files. No visible syntax errors found.

## 🕵️ Suspected Causes (For Claude to Investigate)

Since replacing the source code didn't fix it, the issue likely lies elsewhere:

1. **`node_modules` Corruption:** A dependency might have a corrupted file. Reinstalling `node_modules` (`rm -rf node_modules && npm install`) might be necessary.
2. **Assets Encoding:** A font file (`.ttf`) or image in `./assets` might be corrupted or recognized as text by the bundler, causing UTF-8 errors.
3. **Environment/Terminal:** The user's terminal encoding (Windows Powershell) might be interfering with file writes or Metro output.
4. **Hidden Config Files:** Is there a `.babelrc` or other config file hiding?
5. **Metro/Babel Cache (Deep):** The `-c` flag might not be clearing the specific cache layer causing this (e.g. Kotlin/Gradle build cache).

## 📂 Project Context

- **Framework:** React Native (Expo) with NativeWind (Tailwind).
- **Language:** TypeScript.
- **Key Features:** Google Sign-In, Supabase (Favorites), Calendar, Audio Playback.
- **Localization:** Korean (primary) and English.

**Good luck, Claude. The user is waiting.**
