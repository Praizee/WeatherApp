import { useRef } from "react";
import { View, Text, Pressable } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MotiView } from "moti";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/src/lib/tw";
import { useWeather } from "@/src/hooks/useWeather";
import { getWeatherKey, WEATHER_EMOJI } from "@/src/lib/iconMap";
import { formatTemp } from "@/src/lib/weatherTheme";
import type { SavedCity } from "@/src/hooks/useSavedCities";

interface Props {
  city: SavedCity;
  onPress: () => void;
  onRemove: () => void;
  index?: number;
}

export default function SavedCityRow({ city, onPress, onRemove, index = 0 }: Props) {
  const swipeRef = useRef<Swipeable>(null);
  const { data } = useWeather(city.lat, city.lon);

  const current = data?.current;
  const emoji = current
    ? WEATHER_EMOJI[getWeatherKey(current.weather[0].icon)]
    : "🌡️";
  const temp = current ? formatTemp(current.temp) : "--°";
  const description = current?.weather[0].description ?? "";

  function handleDelete() {
    swipeRef.current?.close();
    onRemove();
  }

  function renderRightActions() {
    return (
      <Pressable
        onPress={handleDelete}
        style={[
          tw`items-center justify-center px-6 my-1 rounded-2xl`,
          { backgroundColor: "#EF4444" },
        ]}
      >
        <Ionicons name="trash-outline" size={22} color="#fff" />
      </Pressable>
    );
  }

  return (
    <MotiView
      from={{ opacity: 0, translateX: 24 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 380, delay: index * 70 }}
    >
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          tw`flex-row items-center justify-between px-5 py-4 mb-2 rounded-2xl`,
          {
            backgroundColor: pressed
              ? "rgba(255,255,255,0.10)"
              : "rgba(255,255,255,0.07)",
          },
        ]}
      >
        <View style={tw`flex-1`}>
          <Text style={tw`text-white text-base font-semibold`}>{city.name}</Text>
          <Text style={tw`text-slate-400 text-xs mt-0.5 capitalize`}>
            {description || [city.state, city.country].filter(Boolean).join(", ")}
          </Text>
        </View>
        <View style={tw`items-end`}>
          <Text style={{ fontSize: 28 }}>{emoji}</Text>
          <Text style={tw`text-white text-lg font-light`}>{temp}</Text>
        </View>
      </Pressable>
    </Swipeable>
    </MotiView>
  );
}
