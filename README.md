# Weather App

A React Native (+Expo) weather app built for HNG 14 Mobile Track Stage 3. Fetches real-time weather from the OpenWeatherMap One Call API 3.0, caches all data with TanStack Query + AsyncStorage, and delivers a fluid animated experience.

---

## Features

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

## Animations

| Surface                  | Implementation                                                         |
| ------------------------ | ---------------------------------------------------------------------- |
| Screen transitions       | `expo-router` Stack `slide_from_right`                                 |
| Weather hero icon        | Reanimated condition-keyed loops (rotate, pulse, bounce, drift, sway)  |
| Temperature display      | Reanimated spring counter via `AnimatedTextInput` + `useAnimatedProps` |
| Hourly strip cards       | Moti stagger fade-up, `delay: index × 40 ms`                           |
| Forecast rows            | Moti stagger slide-left, `delay: index × 55 ms`                        |
| Saved city cards         | Moti stagger slide-right, `delay: index × 70 ms`                       |
| Forecast expand/collapse | Reanimated `withTiming` height + opacity                               |
| Min/max temp bar         | Reanimated `withTiming` width on mount                                 |
| Offline banner           | Reanimated `withTiming` translateY slide                               |

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

3. Start the dev server:
   ```bash
   pnpm expo start
   ```
   Scan the QR code with **Expo Go** — no local prebuild required.

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

---

## Screenshots

> Add screenshots here later...

| Home           | Forecast expanded | Search         | Saved cities   |
| -------------- | ----------------- | -------------- | -------------- |
| _(screenshot)_ | _(screenshot)_    | _(screenshot)_ | _(screenshot)_ |

