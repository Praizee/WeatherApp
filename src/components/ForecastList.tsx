import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/src/lib/tw";
import { formatTemp, formatDay, getWindDirection } from "@/src/lib/weatherTheme";
import { getWeatherKey, WEATHER_EMOJI } from "@/src/lib/iconMap";
import type { OneCallDaily } from "@/src/types/owm";

interface Props {
  daily: OneCallDaily[];
  timezoneOffset: number;
}

export default function ForecastList({ daily, timezoneOffset }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleToggle = useCallback(
    (index: number) => {
      setExpandedIndex((prev) => (prev === index ? null : index));
    },
    []
  );

  return (
    <View style={tw`mx-6 mb-6`}>
      <Text style={tw`text-slate-400 text-xs font-semibold tracking-widest mb-3`}>
        8-DAY FORECAST
      </Text>
      {daily.slice(1).map((day, i) => (
        <MotiView
          key={day.dt}
          from={{ opacity: 0, translateX: -12 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ type: "timing", duration: 380, delay: i * 55 }}
        >
          <ForecastRow
            day={day}
            timezoneOffset={timezoneOffset}
            isExpanded={expandedIndex === i}
            onToggle={() => handleToggle(i)}
          />
        </MotiView>
      ))}
    </View>
  );
}

function ForecastRow({
  day,
  timezoneOffset,
  isExpanded,
  onToggle,
}: {
  day: OneCallDaily;
  timezoneOffset: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const emoji = WEATHER_EMOJI[getWeatherKey(day.weather[0].icon)];
  const dayLabel = formatDay(day.dt, timezoneOffset);
  const detailHeight = useSharedValue(0);
  const detailOpacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? 88 : 0, {
      duration: 280,
      easing: Easing.out(Easing.quad),
    }),
    opacity: withTiming(isExpanded ? 1 : 0, { duration: 220 }),
    overflow: "hidden",
  }));

  void detailHeight;
  void detailOpacity;

  return (
    <View style={tw`border-b border-white/10`}>
      {/* Summary row */}
      <Pressable
        onPress={onToggle}
        style={({ pressed }) =>
          [
            tw`flex-row items-center py-3`,
            pressed && { opacity: 0.75 },
          ]
        }
      >
        <Text style={tw`text-white text-sm w-10`}>{dayLabel}</Text>
        <Text style={{ fontSize: 22, marginRight: 12 }}>{emoji}</Text>
        <View style={tw`flex-1`}>
          <Text style={tw`text-slate-300 text-xs capitalize`}>
            {day.weather[0].description}
          </Text>
        </View>
        {day.pop > 0 && (
          <Text style={tw`text-blue-400 text-xs mr-3`}>
            {Math.round(day.pop * 100)}%
          </Text>
        )}
        <Text style={tw`text-slate-400 text-sm mr-1`}>
          {Math.round(day.temp.min)}°
        </Text>
        <Text style={tw`text-white text-sm font-semibold mr-2`}>
          {Math.round(day.temp.max)}°
        </Text>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color="#94A3B8"
        />
      </Pressable>

      {/* Expanded detail */}
      <Animated.View style={animatedStyle}>
        <View
          style={tw`flex-row flex-wrap gap-x-6 gap-y-2 pb-3 pt-1`}
        >
          <DetailItem
            icon="water-outline"
            label="Humidity"
            value={`${day.humidity}%`}
          />
          <DetailItem
            icon="navigate-outline"
            label="Wind"
            value={`${Math.round(day.wind_speed)} m/s ${getWindDirection(day.wind_deg)}`}
          />
          <DetailItem
            icon="rainy-outline"
            label="Precip"
            value={`${Math.round(day.pop * 100)}%`}
          />
          <DetailItem
            icon="sunny-outline"
            label="UV"
            value={String(Math.round(day.uvi))}
          />
          <DetailItem
            icon="thermometer-outline"
            label="Feels (day)"
            value={formatTemp(day.feels_like.day)}
          />
          <DetailItem
            icon="moon-outline"
            label="Feels (night)"
            value={formatTemp(day.feels_like.night)}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={tw`flex-row items-center gap-1`}>
      <Ionicons name={icon} size={13} color="#64748B" />
      <Text style={tw`text-slate-400 text-xs`}>{label}: </Text>
      <Text style={tw`text-slate-200 text-xs font-medium`}>{value}</Text>
    </View>
  );
}
