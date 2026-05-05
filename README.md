# Weather App

A React Native (+Expo) weather app built for HNG 14 Mobile Track — runs on **Android, iOS, Web, and Linux Desktop** from a single codebase. Fetches real-time weather from the OpenWeatherMap One Call API 3.0, caches all data with TanStack Query + AsyncStorage, and delivers a fluid animated experience across all platforms.

---

## Platform Support

| Platform | How to run | Notes |
| --- | --- | --- |
| Android | `pnpm android` | Expo Go or APK |
| iOS | `pnpm ios` | Expo Go |
| Web (browser) | `pnpm web` | localhost:8081 |
| Linux Desktop | `pnpm electron:dev` | Electron wrapping the web build |

**Live web demo:** [https://weather-app-seven-delta-35.vercel.app/](https://weather-app-seven-delta-35.vercel.app/)

---

## Features

### Desktop & Web (Stage 4)

- Responsive sidebar navigation — full labels on desktop (≥1100 px), icons-only on tablet (≥768 px), hidden on mobile
- Two-column layout on desktop: hero + detail pills on the left, hourly strip + forecast on the right
- Saved cities switches to a 2-column grid on desktop
- Right-click context menus — native OS menu on Electron, animated React overlay on web
- 5 keyboard shortcuts (see table below)
- Hover states and cursor pointer on all interactive elements
- Electron desktop app with native app menu, AppImage + deb + tar.gz Linux builds

### Current Weather

- Condition-keyed gradient backgrounds (clear, cloudy, rain, snow, storm, night)
- Animated weather icon reacting to conditions (rotating sun, bouncing rain, drifting snow, etc.)
- Spring-animated temperature counter
- Humidity, wind speed/direction, visibility, UV index, pressure, dew point

### Forecasts

- 24-hour hourly strip with snap scroll, precipitation probability, "Now" highlight
- 8-day daily forecast with animated min/max temperature range bar
- Tap any day to expand — reveals humidity, wind, precip %, UV, feels-like day/night

### Location

- GPS-based weather on launch with graceful permission denied fallback
- Reverse geocoding shows real city name in the header
- Search for any city by name (debounced, 400 ms)

### Saved Cities

- Bookmark cities from search results
- Persisted list with live weather thumbnail (emoji + current temp)
- Swipe-to-delete with haptic feedback
- Full city detail screen with identical layout to home

### Offline & Error Handling

- TanStack Query persister caches all API responses to AsyncStorage (24 h TTL)
- Cold launch with no internet renders last-known data instantly
- Animated offline banner slides in on connection loss, auto-hides on reconnect
- Per-screen error states with retry buttons for: rate limit (429), invalid key (401), network timeout, location denial, empty search

### Loading States

- Shimmer skeleton loaders sized to match real component dimensions (no layout jump)
- Hourly strip uses activity indicator while fetching

---

## Keyboard Shortcuts

| Shortcut | Action |
| --- | --- |
| `Ctrl + F` | Open city search |
| `Ctrl + H` | Go to home screen |
| `Ctrl + B` | Open saved cities |
| `F5` / `Ctrl + R` | Refresh weather data |
| `Escape` | Close context menu / go back |

Shortcuts also wired into the Electron app menu (File / View / Help) so they appear in native menu bars.

---

## Animations

| Surface                  | Implementation                                                              |
| ------------------------ | --------------------------------------------------------------------------- |
| Screen transitions       | `expo-router` Stack `slide_from_right`                                      |
| Weather hero icon        | Lottie JSON animations (cross-platform via `lottie-react-native`)           |
| Saved city icon          | Lottie, condition-keyed, size 44                                            |
| Temperature display      | Reanimated spring counter via `AnimatedTextInput` + `useAnimatedProps`      |
| Hourly strip cards       | Moti stagger fade-up, `delay: index × 40 ms`                                |
| Forecast rows            | Moti stagger slide-left, `delay: index × 55 ms`                             |
| Saved city cards         | Moti stagger slide-right, `delay: index × 70 ms`                            |
| Forecast expand/collapse | Reanimated `withTiming` height + opacity                                    |
| Min/max temp bar         | Reanimated `withTiming` width on mount                                      |
| Offline banner           | Reanimated `withTiming` translateY slide                                    |
| Context menu             | Moti `opacity 0→1, scale 0.92→1`, 120 ms                                   |

---

## API

**OpenWeatherMap One Call API 3.0** — [openweathermap.org/api](https://openweathermap.org/api)

| Endpoint                | Used for                                                |
| ----------------------- | ------------------------------------------------------- |
| `GET /data/3.0/onecall` | Current weather + 48 h hourly + 8-day daily in one call |
| `GET /geo/1.0/direct`   | City name → coordinates (search)                        |
| `GET /geo/1.0/reverse`  | Coordinates → city name (home header)                   |

> Requires a **One Call API 3.0** subscription (free tier: 1,000 calls/day, credit card required at openweathermap.org).

---

## Setup

1. Clone the repo and install dependencies:

   ```bash
   pnpm install
   ```

2. Create a `.env` file in the project root:

   ```
   EXPO_PUBLIC_OWM_KEY=your_openweathermap_api_key
   ```

### Mobile (Android / iOS)

```bash
pnpm android   # opens in Android emulator or device via Expo Go
pnpm ios       # opens in iOS simulator
```

### Web (browser)

```bash
pnpm web
# → http://localhost:8081
```

### Desktop (Electron — Linux)

**Dev mode** (two terminals):

```bash
# Terminal 1 — start the Expo web server
pnpm web

# Terminal 2 — once the bundle is ready, launch Electron
pnpm electron:start
```

Or use the combined one-liner (waits for the bundle automatically):

```bash
pnpm electron:dev
```

**Build Linux packages** (AppImage + deb + tar.gz → `release/`):

```bash
pnpm electron:build
```

> If you get a FUSE error on Ubuntu when running the AppImage: `sudo apt install libfuse2`

**Download AppImage:** [Google Drive link](https://drive.google.com/your-link-here) _(replace with your Drive link)_

---

## Architecture

```
app/                    # expo-router file-based screens
├── _layout.tsx         # GestureHandler → SafeArea → PersistQueryClient → Stack
├── index.tsx           # Home (GPS location)
├── search.tsx          # City search
├── cities.tsx          # Saved cities list
└── city/[id].tsx       # City detail (lat_lon encoded in route param)

src/
├── api/
│   ├── client.ts       # apiFetch<T>: key injection, 10 s timeout, WeatherApiError
│   └── owm.ts          # getOneCall, geoSearch, reverseGeo
├── hooks/
│   ├── useWeather.ts         # useQuery → getOneCall, staleTime 30 min
│   ├── useDeviceLocation.ts  # Permission state machine
│   ├── useReverseGeo.ts      # useQuery → reverseGeo, select → string
│   ├── useCitySearch.ts      # useQuery → geoSearch, enabled >= 2 chars
│   ├── useSavedCities.ts     # useQuery + useMutation → AsyncStorage
│   └── useNetworkStatus.ts   # NetInfo → isConnected
├── query/
│   ├── client.ts       # QueryClient config
│   └── persister.ts    # AsyncStorage persister, maxAge 24 h
├── components/         # AnimatedWeatherIcon, AnimatedTemp, HourlyStrip,
│                       # ForecastList, SavedCityRow, SkeletonBlock,
│                       # OfflineBanner, ErrorState
├── lib/
│   ├── tw.ts           # twrnc instance
│   ├── weatherTheme.ts # Condition → gradient + formatters
│   ├── iconMap.ts      # OWM icon code → WeatherKey → emoji
│   └── netStatus.ts    # NetInfo → TanStack onlineManager
└── types/owm.ts        # TypeScript types for all OWM response shapes
```

---

## Dependencies

| Package                                     | Purpose                                                |
| ------------------------------------------- | ------------------------------------------------------ |
| `expo-router`                               | File-based routing + animated screen transitions       |
| `@tanstack/react-query`                     | Server state, caching, background refetch              |
| `@tanstack/react-query-persist-client`      | Persist query cache across restarts                    |
| `@tanstack/query-async-storage-persister`   | AsyncStorage adapter for persister                     |
| `@react-native-async-storage/async-storage` | Offline cache + saved cities storage                   |
| `@react-native-community/netinfo`           | Network connectivity detection                         |
| `react-native-reanimated`                   | UI-thread animations (spring, timing, loops)           |
| `moti`                                      | Declarative enter/exit animations on top of Reanimated |
| `twrnc`                                     | Tailwind CSS utility classes for React Native          |
| `expo-location`                             | Device GPS + permission management                     |
| `expo-linear-gradient`                      | Condition-keyed gradient backgrounds                   |
| `expo-haptics`                              | Tactile feedback on key interactions                   |
| `expo-clipboard`                            | Copy to clipboard on native                            |
| `lottie-react-native`                       | Lottie animations on Android, iOS, and web             |
| `@lottiefiles/dotlottie-react`              | Web renderer used internally by lottie-react-native    |
| `react-native-web`                          | React Native components targeting the browser DOM      |
| `electron`                                  | Desktop app shell (wraps the Expo web build)           |
| `electron-builder`                          | Packages Electron app → AppImage, deb, tar.gz          |

---

## Screenshots

### Mobile

| Home | Forecast expanded | Search | Saved cities |
| :---: | :---: | :---: | :---: |
| <img src="https://github.com/user-attachments/assets/d3277fc3-a18f-4626-b1b8-0cad1213bfc5" width="250" alt="Home" /> | <img src="https://github.com/user-attachments/assets/2f0435b8-e28f-441b-bc9e-1f44e2131d76" width="250" alt="Forecast expanded" /> | <img src="https://github.com/user-attachments/assets/bd988193-0f0e-4894-be4d-66be7376f5ac" width="250" alt="Search" /> | <img src="https://github.com/user-attachments/assets/b43ec76f-d515-4710-9a86-efbf9a6767c1" width="250" alt="Saved cities" /> |

### Web & Desktop

#### Web (browser)

<img width="1918" height="1007" alt="image" src="https://github.com/user-attachments/assets/9f2551af-b340-4f71-89d1-c1dad3a2f2ff" /> 


#### Desktop (Electron)

<img width="1919" height="1054" alt="image" src="https://github.com/user-attachments/assets/ff6231ab-e248-4930-a34a-ff71fede2153" />

