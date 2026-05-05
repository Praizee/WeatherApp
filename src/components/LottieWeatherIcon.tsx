import LottieView from 'lottie-react-native';
import type { AnimationObject } from 'lottie-react-native';
import type { WeatherKey } from '@/src/lib/iconMap';

const LOTTIE_MAP: Record<WeatherKey | 'loading', AnimationObject> = {
  'clear-day':          require('@/assets/lottie/clear-day.json'),
  'clear-night':        require('@/assets/lottie/clear-night.json'),
  'partly-cloudy-day':  require('@/assets/lottie/partly-cloudy-day.json'),
  'partly-cloudy-night':require('@/assets/lottie/partly-cloudy-night.json'),
  'cloudy':             require('@/assets/lottie/cloudy.json'),
  'rain':               require('@/assets/lottie/rain.json'),
  'drizzle':            require('@/assets/lottie/drizzle.json'),
  'thunderstorm':       require('@/assets/lottie/thunderstorm.json'),
  'snow':               require('@/assets/lottie/snow.json'),
  'fog':                require('@/assets/lottie/fog.json'),
  'loading':            require('@/assets/lottie/loading.json'),
};

interface Props {
  weatherKey: WeatherKey | 'loading';
  size?: number;
}

export default function LottieWeatherIcon({ weatherKey, size = 72 }: Props) {
  return (
    <LottieView
      source={LOTTIE_MAP[weatherKey]}
      autoPlay
      loop
      resizeMode="cover"
      style={{ width: size, height: size }}
    />
  );
}
