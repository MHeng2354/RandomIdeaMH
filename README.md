# Pokémon TCG Budget

Pokémon TCG Budget is an Expo-based mobile prototype that lets players open Pokémon TCG packs, reveal cards, manage a personal collection, and explore a fast-paced WonderMiss mode to chase rare pulls.

## What the app does

- Open booster packs and reveal pulled cards in the pack screen
- Browse and filter your collection by rarity in the Pokédex-style collection view
- Run a curated WonderMiss session with six selected cards and a quick reveal flow
- Track your Ancestors balance and persist progress locally using Async Storage
- Enable God Mode for a higher chance of premium pulls

## Tech stack

- Expo SDK 54
- Expo Router and file-based navigation
- React Native 0.81
- TypeScript
- Async Storage for local state persistence
- Expo Vector Icons and Google Fonts for the UI

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the development server

   ```bash
   npx expo start
   ```

3. Open it on a device or emulator

   - Android emulator or physical device
   - iOS simulator or physical device
   - Expo Go for quick testing

## Export / build for mobile

### Android

- Build an Android APK or AAB with Expo managed workflow:

  ```bash
  npx eas build --platform android
  ```

- Run the Android app locally from the project:

  ```bash
  npm run android
  ```

### iOS

- Build an iOS app with EAS Build:

  ```bash
  npx eas build --platform ios
  ```

- Run the iOS app locally from the project:

  ```bash
  npm run ios
  ```

## Useful commands

- `npm run web` — run the web version
- `npm run lint` — check for lint issues

## Project structure

- `app/` — Expo Router screens and navigation
- `components/` — reusable UI components
- `context/` — shared game state
- `data/` — pack metadata
- `utils/` — pull logic, storage helpers, and API wrappers

## Notes

This app fetches card data from the Pokémon TCG API and stores local session data so your collection, last pack, and God Mode setting persist between launches.

If you want to reset the starter structure, run:

```bash
npm run reset-project
```
