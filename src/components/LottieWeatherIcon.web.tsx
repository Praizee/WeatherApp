import type { WeatherKey } from "@/src/lib/iconMap";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// These are 1400×3120 phone-portrait animations. Using fit:'cover' + top-center
// alignment zooms in on the weather element that lives in the upper portion.
const LOTTIE_MAP: Record<WeatherKey | "loading", object> = {
  "clear-day": require("@/assets/lottie/clear-day.json"),
  "clear-night": require("@/assets/lottie/clear-night.json"),
  "partly-cloudy-day": require("@/assets/lottie/partly-cloudy-day.json"),
  "partly-cloudy-night": require("@/assets/lottie/partly-cloudy-night.json"),
  cloudy: require("@/assets/lottie/cloudy.json"),
  rain: require("@/assets/lottie/rain.json"),
  drizzle: require("@/assets/lottie/drizzle.json"),
  thunderstorm: require("@/assets/lottie/thunderstorm.json"),
  snow: require("@/assets/lottie/snow.json"),
  fog: require("@/assets/lottie/fog.json"),
  loading: require("@/assets/lottie/loading.json"),
};

interface Props {
  weatherKey: WeatherKey | "loading";
  size?: number;
}

export default function LottieWeatherIcon({ weatherKey, size = 72 }: Props) {
  const source = LOTTIE_MAP[weatherKey];
  return (
    <DotLottieReact
      data={JSON.stringify(source)}
      autoplay
      loop
      style={{ width: size, height: size, display: "block" }}
      layout={{ fit: "cover", align: [0.5, 0.25] } as any}
    />
  );
}

