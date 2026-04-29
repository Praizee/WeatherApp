import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/src/lib/tw";
import { parseCityId, useSavedCities, useAddCity, useRemoveCity, makeCityId } from "@/src/hooks/useSavedCities";
import { useWeather } from "@/src/hooks/useWeather";
import { HomeSkeleton } from "@/src/components/SkeletonBlock";
import ErrorState from "@/src/components/ErrorState";
import HourlyStrip from "@/src/components/HourlyStrip";
import ForecastList from "@/src/components/ForecastList";
import AnimatedWeatherIcon from "@/src/components/AnimatedWeatherIcon";
import AnimatedTemp from "@/src/components/AnimatedTemp";
import {
  getWeatherTheme,
  isNightTime,
  formatTemp,
  getWindDirection,
} from "@/src/lib/weatherTheme";
import { getWeatherKey } from "@/src/lib/iconMap";
import { WeatherApiError } from "@/src/api/client";

export default function CityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { lat, lon } = parseCityId(id);
  const insets = useSafeAreaInsets();

  const { data, isLoading, isFetching, error, refetch } = useWeather(lat, lon);
  const { data: savedCities } = useSavedCities();
  const addCity = useAddCity();
  const removeCity = useRemoveCity();

  const cityInfo = savedCities?.find((c) => c.id === id);
  const cityName = cityInfo?.name ?? "City";
  const isSaved = Boolean(cityInfo);

  function toggleSave() {
    if (isSaved && cityInfo) {
      removeCity.mutate(cityInfo.id);
    } else if (data) {
      addCity.mutate({
        id: makeCityId(lat, lon),
        name: cityName,
        country: cityInfo?.country ?? "",
        state: cityInfo?.state,
        lat,
        lon,
      });
    }
  }

  if (isLoading && !data) {
    return (
      <LinearGradient colors={["#0B1220", "#0F1F3D", "#0B1220"]} style={{ flex: 1 }}>
        <View style={{ paddingTop: insets.top + 12 }}>
          <Pressable onPress={() => router.back()} style={tw`px-5 mb-2`} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
        </View>
        <HomeSkeleton />
      </LinearGradient>
    );
  }

  if (error && !data) {
    const isRateLimit = error instanceof WeatherApiError && error.statusCode === 429;
    return (
      <LinearGradient colors={["#0B1220", "#0F1F3D", "#0B1220"]} style={{ flex: 1 }}>
        <View style={{ paddingTop: insets.top + 12 }}>
          <Pressable onPress={() => router.back()} style={tw`px-5 mb-2`} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
        </View>
        <ErrorState
          title={isRateLimit ? "Too many requests" : "Couldn't load weather"}
          message={
            isRateLimit
              ? "You've hit the API rate limit. Please wait a moment and try again."
              : "Check your connection and try again."
          }
          onRetry={() => refetch()}
        />
      </LinearGradient>
    );
  }

  if (!data) return null;

  const { current, hourly, daily, timezone_offset } = data;
  const condition = current.weather[0];
  const night = isNightTime(current.dt, current.sunrise, current.sunset);
  const theme = getWeatherTheme(condition.id, night);

  return (
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor="#ffffff"
          />
        }
      >
        {/* Header */}
        <View style={tw`flex-row items-center justify-between px-5 mb-6`}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <Text style={tw`text-white text-sm font-medium tracking-wide flex-1 text-center`}>
            {cityName}
          </Text>
          <Pressable onPress={toggleSave} hitSlop={12}>
            <Ionicons
              name={isSaved ? "bookmark" : "bookmark-outline"}
              size={22}
              color={isSaved ? "#60A5FA" : "#ffffff"}
            />
          </Pressable>
        </View>

        {/* Hero */}
        <View style={tw`items-center px-6 mb-8`}>
          <AnimatedWeatherIcon weatherKey={getWeatherKey(condition.icon)} size={72} />
          <AnimatedTemp temp={current.temp} fontSize={96} />
          <Text style={tw`text-white text-2xl font-light capitalize mb-1`}>
            {condition.description}
          </Text>
          <Text style={tw`text-slate-300 text-sm`}>
            Feels like {formatTemp(current.feels_like)}
          </Text>
        </View>

        {/* Detail pills row 1 */}
        <View style={tw`flex-row mx-6 gap-3 mb-3`}>
          <DetailPill icon="water-outline" label="Humidity" value={`${current.humidity}%`} />
          <DetailPill
            icon="navigate-outline"
            label="Wind"
            value={`${Math.round(current.wind_speed)} m/s ${getWindDirection(current.wind_deg)}`}
          />
          <DetailPill
            icon="eye-outline"
            label="Visibility"
            value={`${Math.round((current.visibility ?? 0) / 1000)} km`}
          />
        </View>

        {/* Detail pills row 2 */}
        <View style={tw`flex-row mx-6 gap-3 mb-8`}>
          <DetailPill icon="sunny-outline" label="UV Index" value={String(Math.round(current.uvi))} />
          <DetailPill icon="speedometer-outline" label="Pressure" value={`${current.pressure} hPa`} />
          <DetailPill icon="thermometer-outline" label="Dew Point" value={formatTemp(current.dew_point)} />
        </View>

        {/* Hourly */}
        <HourlyStrip hours={hourly} timezoneOffset={timezone_offset} />

        {/* 8-day forecast */}
        <ForecastList daily={daily} timezoneOffset={timezone_offset} />
      </ScrollView>
    </LinearGradient>
  );
}

function DetailPill({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View
      style={[
        tw`flex-1 items-center py-3 rounded-2xl`,
        { backgroundColor: "rgba(255,255,255,0.08)" },
      ]}
    >
      <Ionicons name={icon} size={18} color="#94A3B8" style={tw`mb-1`} />
      <Text style={tw`text-white text-sm font-semibold`}>{value}</Text>
      <Text style={tw`text-slate-400 text-xs`}>{label}</Text>
    </View>
  );
}
