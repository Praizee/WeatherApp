import { useState, useCallback } from "react";
import { View, Text, Pressable } from "react-native";
import { MotiView } from "moti";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
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

  const days = daily.slice(1);
  const globalMin = Math.min(...days.map((d) => d.temp.min));
  const globalMax = Math.max(...days.map((d) => d.temp.max));

  const handleToggle = useCallback((index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <View style={tw`mx-6 mb-6`}>
      <Text style={tw`text-slate-400 text-xs font-semibold tracking-widest mb-3`}>
        8-DAY FORECAST
      </Text>
      {days.map((day, i) => (
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
            globalMin={globalMin}
            globalMax={globalMax}
          />
        </MotiView>
      ))}
    </View>
  );
}

function TempBar({
  min,
  max,
  globalMin,
  globalMax,
}: {
  min: number;
  max: number;
  globalMin: number;
  globalMax: number;
}) {
  const range = globalMax - globalMin || 1;
  const startRatio = (min - globalMin) / range;
  const widthRatio = (max - min) / range;

  const barWidth = useSharedValue(0);
  const animStyle = useAnimatedStyle(() => ({
    width: `${barWidth.value * 100}%` as `${number}%`,
    marginLeft: `${startRatio * 100}%` as `${number}%`,
  }));

  // Animate in on mount
  barWidth.value = withTiming(widthRatio, {
    duration: 600,
    easing: Easing.out(Easing.quad),
  });

  return (
    <View style={[tw`flex-1 rounded-full mx-2`, { height: 4, backgroundColor: "rgba(255,255,255,0.1)" }]}>
      <Animated.View
        style={[animStyle, { height: 4, borderRadius: 2, backgroundColor: "#60A5FA" }]}
      />
    </View>
  );
}

function ForecastRow({
  day,
  timezoneOffset,
  isExpanded,
  onToggle,
  globalMin,
  globalMax,
}: {
  day: OneCallDaily;
  timezoneOffset: number;
  isExpanded: boolean;
  onToggle: () => void;
  globalMin: number;
  globalMax: number;
}) {
  const emoji = WEATHER_EMOJI[getWeatherKey(day.weather[0].icon)];
  const dayLabel = formatDay(day.dt, timezoneOffset);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(isExpanded ? 96 : 0, {
      duration: 280,
      easing: Easing.out(Easing.quad),
    }),
    opacity: withTiming(isExpanded ? 1 : 0, { duration: 220 }),
    overflow: "hidden",
  }));

  return (
    <View style={tw`border-b border-white/10`}>
      {/* Summary row */}
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [tw`flex-row items-center py-3`, pressed && { opacity: 0.75 }]}
      >
        <Text style={tw`text-white text-sm w-10`}>{dayLabel}</Text>
        <Text style={{ fontSize: 20, marginRight: 8 }}>{emoji}</Text>
        <Text style={tw`text-slate-400 text-sm w-8 text-right`}>
          {Math.round(day.temp.min)}°
        </Text>
        <TempBar
          min={day.temp.min}
          max={day.temp.max}
          globalMin={globalMin}
          globalMax={globalMax}
        />
        <Text style={tw`text-white text-sm font-semibold w-8`}>
          {Math.round(day.temp.max)}°
        </Text>
        {day.pop > 0.1 && (
          <Text style={tw`text-blue-400 text-xs w-8 text-right`}>
            {Math.round(day.pop * 100)}%
          </Text>
        )}
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={13}
          color="#64748B"
          style={tw`ml-1`}
        />
      </Pressable>

      {/* Expanded detail */}
      <Animated.View style={animatedStyle}>
        <View style={tw`flex-row flex-wrap gap-x-6 gap-y-2 pb-3 pt-1`}>
          <DetailItem icon="water-outline" label="Humidity" value={`${day.humidity}%`} />
          <DetailItem
            icon="navigate-outline"
            label="Wind"
            value={`${Math.round(day.wind_speed)} m/s ${getWindDirection(day.wind_deg)}`}
          />
          <DetailItem icon="rainy-outline" label="Precip" value={`${Math.round(day.pop * 100)}%`} />
          <DetailItem icon="sunny-outline" label="UV" value={String(Math.round(day.uvi))} />
          <DetailItem icon="thermometer-outline" label="Feels (day)" value={formatTemp(day.feels_like.day)} />
          <DetailItem icon="moon-outline" label="Feels (night)" value={formatTemp(day.feels_like.night)} />
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
