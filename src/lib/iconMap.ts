// Maps OWM icon codes to a simple emoji label used as a fallback
// and to a semantic key used in Phase 6 to pick Lottie animations.
export type WeatherKey =
  | "clear-day"
  | "clear-night"
  | "partly-cloudy-day"
  | "partly-cloudy-night"
  | "cloudy"
  | "rain"
  | "drizzle"
  | "thunderstorm"
  | "snow"
  | "fog";

const OWM_ICON_MAP: Record<string, WeatherKey> = {
  "01d": "clear-day",
  "01n": "clear-night",
  "02d": "partly-cloudy-day",
  "02n": "partly-cloudy-night",
  "03d": "cloudy",
  "03n": "cloudy",
  "04d": "cloudy",
  "04n": "cloudy",
  "09d": "drizzle",
  "09n": "drizzle",
  "10d": "rain",
  "10n": "rain",
  "11d": "thunderstorm",
  "11n": "thunderstorm",
  "13d": "snow",
  "13n": "snow",
  "50d": "fog",
  "50n": "fog",
};

export const WEATHER_EMOJI: Record<WeatherKey, string> = {
  "clear-day": "☀️",
  "clear-night": "🌙",
  "partly-cloudy-day": "⛅",
  "partly-cloudy-night": "🌤️",
  cloudy: "☁️",
  rain: "🌧️",
  drizzle: "🌦️",
  thunderstorm: "⛈️",
  snow: "❄️",
  fog: "🌫️",
};

export function getWeatherKey(owmIconCode: string): WeatherKey {
  return OWM_ICON_MAP[owmIconCode] ?? "cloudy";
}
