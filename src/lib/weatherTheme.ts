export type WeatherTheme = {
  gradient: [string, string, string];
  label: string;
};

// OWM condition code ranges: https://openweathermap.org/weather-conditions
export function getWeatherTheme(
  conditionId: number,
  isNight: boolean
): WeatherTheme {
  if (isNight) {
    return {
      gradient: ["#0B1220", "#0F1F3D", "#0B1220"],
      label: "Night",
    };
  }

  if (conditionId >= 200 && conditionId < 300) {
    return { gradient: ["#1A1A2E", "#16213E", "#0F3460"], label: "Thunderstorm" };
  }
  if (conditionId >= 300 && conditionId < 600) {
    return { gradient: ["#1C2B3A", "#2D4A6A", "#1C3A5A"], label: "Rain" };
  }
  if (conditionId >= 600 && conditionId < 700) {
    return { gradient: ["#1E2D45", "#2E4A6E", "#3A5A80"], label: "Snow" };
  }
  if (conditionId >= 700 && conditionId < 800) {
    return { gradient: ["#1A2535", "#2A3F55", "#1A2535"], label: "Fog" };
  }
  if (conditionId === 800) {
    return { gradient: ["#0B4F8A", "#1A73C8", "#0B4F8A"], label: "Clear" };
  }
  if (conditionId === 801 || conditionId === 802) {
    return { gradient: ["#1A3A6A", "#2A5A9A", "#1A3A6A"], label: "Partly Cloudy" };
  }
  return { gradient: ["#1E2D45", "#2A3F5F", "#1E2D45"], label: "Cloudy" };
}

export function isNightTime(dt: number, sunrise: number, sunset: number): boolean {
  return dt < sunrise || dt > sunset;
}

export function formatTemp(temp: number): string {
  return `${Math.round(temp)}°`;
}

export function formatTime(dt: number, timezoneOffset: number): string {
  const utcMs = dt * 1000;
  const localMs = utcMs + timezoneOffset * 1000;
  const d = new Date(localMs);
  const h = d.getUTCHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}${ampm}`;
}

export function formatDay(dt: number, timezoneOffset: number): string {
  const utcMs = dt * 1000;
  const localMs = utcMs + timezoneOffset * 1000;
  const d = new Date(localMs);
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
}

export function getWindDirection(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
