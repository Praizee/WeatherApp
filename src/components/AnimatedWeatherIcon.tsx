import { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  cancelAnimation,
  Easing,
} from "react-native-reanimated";
import type { WeatherKey } from "@/src/lib/iconMap";
import { WEATHER_EMOJI } from "@/src/lib/iconMap";

interface Props {
  weatherKey: WeatherKey;
  size?: number;
}

export default function AnimatedWeatherIcon({ weatherKey, size = 72 }: Props) {
  const rotate = useSharedValue(0);
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    cancelAnimation(rotate);
    cancelAnimation(translateY);
    cancelAnimation(translateX);
    cancelAnimation(scale);
    rotate.value = 0;
    translateY.value = 0;
    translateX.value = 0;
    scale.value = 1;

    switch (weatherKey) {
      case "clear-day":
        // slow sun rotation + gentle scale pulse
        rotate.value = withRepeat(
          withTiming(360, { duration: 12000, easing: Easing.linear }),
          -1,
          false
        );
        scale.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;

      case "clear-night":
        // soft glow pulse
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
            withTiming(1.0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;

      case "partly-cloudy-day":
      case "partly-cloudy-night":
      case "cloudy":
      case "fog":
        // gentle horizontal drift
        translateX.value = withRepeat(
          withSequence(
            withTiming(6, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
            withTiming(-6, { duration: 2500, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;

      case "rain":
      case "drizzle":
        // rain drop bounce
        translateY.value = withRepeat(
          withSequence(
            withTiming(-8, { duration: 350, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 350, easing: Easing.in(Easing.quad) })
          ),
          -1,
          false
        );
        break;

      case "thunderstorm":
        // intense scale flash
        scale.value = withRepeat(
          withSequence(
            withTiming(1.15, { duration: 120 }),
            withTiming(0.95, { duration: 120 }),
            withTiming(1.0, { duration: 800 })
          ),
          -1,
          false
        );
        break;

      case "snow":
        // slow horizontal sway + slight rotation
        translateX.value = withRepeat(
          withSequence(
            withTiming(10, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
            withTiming(-10, { duration: 3000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        rotate.value = withRepeat(
          withSequence(
            withTiming(15, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
            withTiming(-15, { duration: 3000, easing: Easing.inOut(Easing.sin) })
          ),
          -1,
          false
        );
        break;
    }
  }, [weatherKey, rotate, translateY, translateX, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={{ fontSize: size, lineHeight: size + 8 }}>
        {WEATHER_EMOJI[weatherKey]}
      </Text>
    </Animated.View>
  );
}
