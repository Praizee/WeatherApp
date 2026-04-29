import { FlatList, View, Text } from "react-native";
import tw from "@/src/lib/tw";
import { formatTime, formatTemp } from "@/src/lib/weatherTheme";
import { getWeatherKey, WEATHER_EMOJI } from "@/src/lib/iconMap";
import type { OneCallHourly } from "@/src/types/owm";

interface Props {
  hours: OneCallHourly[];
  timezoneOffset: number;
}

export default function HourlyStrip({ hours, timezoneOffset }: Props) {
  const items = hours.slice(0, 24);

  return (
    <View style={tw`mb-6`}>
      <Text style={tw`text-slate-400 text-xs font-semibold tracking-widest mb-3 px-6`}>
        HOURLY FORECAST
      </Text>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.dt)}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        snapToInterval={76}
        decelerationRate="fast"
        renderItem={({ item, index }) => (
          <HourCard item={item} timezoneOffset={timezoneOffset} isNow={index === 0} />
        )}
      />
    </View>
  );
}

function HourCard({
  item,
  timezoneOffset,
  isNow,
}: {
  item: OneCallHourly;
  timezoneOffset: number;
  isNow: boolean;
}) {
  const emoji = WEATHER_EMOJI[getWeatherKey(item.weather[0].icon)];
  const label = isNow ? "Now" : formatTime(item.dt, timezoneOffset);

  return (
    <View
      style={[
        tw`items-center py-3 rounded-2xl`,
        {
          width: 68,
          backgroundColor: isNow
            ? "rgba(255,255,255,0.15)"
            : "rgba(255,255,255,0.07)",
          borderWidth: isNow ? 1 : 0,
          borderColor: "rgba(255,255,255,0.2)",
        },
      ]}
    >
      <Text style={tw`text-slate-300 text-xs mb-2`}>{label}</Text>
      <Text style={{ fontSize: 22, marginBottom: 8 }}>{emoji}</Text>
      {item.pop > 0 && (
        <Text style={tw`text-blue-400 text-xs mb-1`}>
          {Math.round(item.pop * 100)}%
        </Text>
      )}
      <Text style={tw`text-white text-sm font-semibold`}>
        {formatTemp(item.temp)}
      </Text>
    </View>
  );
}
