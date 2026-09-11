# Grey Eagle Casino Heritage

React Native 0.86 / TypeScript application with React Navigation native stack and five bottom tabs. All photography and branding are bundled from `src/assets`.

## Run

```sh
npm install
cd ios && pod install && cd ..
npm start
npm run ios
```

For Android, use `npm run android` with an emulator or connected device and the Android SDK configured.

## Structure

- `src/navigation`: typed routes, native stack and custom gradient tab bar
- `src/screens`: loading, onboarding, heritage, glossary, rooms, services, Q&A, personal events, places and location overview
- `src/components`: shared controls, typography, icons and layouts
- `src/data`: supplied cultural content, room descriptions, FAQ and local asset mappings
- `src/storage`: persisted onboarding, room number, requests, plans and chat
- `src/utils`: map routing and external-link handling

## Behaviour

The local WebView animates the loading bar for four seconds. First-time visitors then see three onboarding pages; subsequent launches open the main navigation. Safe areas and scrollable screens support smaller devices.

The glossary provides search, category filters and expandable definitions. Heritage articles can be shared. All five room categories have full descriptions and amenities. Service forms validate room numbers, persist requests and offer the native share sheet; cancellation updates the saved request. Personal event plans support creating, editing, deleting and date navigation. Q&A matches the supplied FAQ offline and explicitly reports when no answer is available. Place details offer native map directions and cultural-tour email drafts.

## Integration boundaries

No hotel API, authenticated guest system, event feed or payment provider was supplied. Service requests are explicitly saved locally, not delivered automatically. Plans are personal records, not issued tickets. Sharing or opening an email draft requires the user to complete delivery in the selected app. The in-app location overview is a schematic plotted from supplied coordinates; actual navigation opens the phone’s map app. No remote photos, fabricated events, prices, room assignments or confirmation statuses are included.

AsyncStorage is device-local storage and is not encrypted. Content comes from the supplied materials; time-sensitive pool arrangements and box-office hours are labeled for confirmation with the hotel.

## Checks

```sh
npx tsc --noEmit
npx eslint App.tsx src __tests__ --quiet
npm test -- --runInBand --watchman=false
```
