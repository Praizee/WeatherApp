import { ScrollView, View, Text, Pressable, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import tw from "@/src/lib/tw";
import { useDeviceLocation } from "@/src/hooks/useDeviceLocation";
import { useWeather } from "@/src/hooks/useWeather";
import { HomeSkeleton } from "@/src/components/SkeletonBlock";
import ErrorState from "@/src/components/ErrorState";
import {
  getWeatherTheme,
  isNightTime,
  formatTemp,
  getWindDirection,
} from "@/src/lib/weatherTheme";
import { getWeatherKey, WEATHER_EMOJI } from "@/src/lib/iconMap";
import { WeatherApiError } from "@/src/api/client";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const location = useDeviceLocation();

  const lat = location.status === "ready" ? location.lat : null;
  const lon = location.status === "ready" ? location.lon : null;

  const { data, isLoading, isFetching, error, refetch } = useWeather(lat, lon);

  // --- location loading / error states ---
  if (location.status === "loading") {
    return (
      <LinearGradient colors={["#0B1220", "#0F1F3D", "#0B1220"]} style={{ flex: 1 }}>
        <HomeSkeleton />
      </LinearGradient>
    );
  }

  if (location.status === "denied") {
    return (
      <LinearGradient colors={["#0B1220", "#0F1F3D", "#0B1220"]} style={{ flex: 1 }}>
        <ErrorState
          icon="location-outline"
          title="Location access denied"
          message="Grant location permission so WeatherApp can show your local weather, or search for a city manually."
          action={{ label: "Search for a city →", onPress: () => router.push("/search") }}
        />
      </LinearGradient>
    );
  }

  if (location.status === "error") {
    return (
      <LinearGradient colors={["#0B1220", "#0F1F3D", "#0B1220"]} style={{ flex: 1 }}>
        <ErrorState
          title="Couldn't get location"
          message={location.message}
          action={{ label: "Search for a city →", onPress: () => router.push("/search") }}
        />
      </LinearGradient>
    );
  }

  // --- data loading ---
  if (isLoading && !data) {
    return (
      <LinearGradient colors={["#0B1220", "#0F1F3D", "#0B1220"]} style={{ flex: 1 }}>
        <HomeSkeleton />
      </LinearGradient>
    );
  }

  // --- data error ---
  if (error && !data) {
    const isRateLimit = error instanceof WeatherApiError && error.statusCode === 429;
    const isAuth = error instanceof WeatherApiError && error.statusCode === 401;
    return (
      <LinearGradient colors={["#0B1220", "#0F1F3D", "#0B1220"]} style={{ flex: 1 }}>
        <ErrorState
          title={isRateLimit ? "Too many requests" : isAuth ? "Invalid API key" : "Couldn't load weather"}
          message={
            isRateLimit
              ? "You've hit the API rate limit. Please wait a moment and try again."
              : isAuth
              ? "Check your EXPO_PUBLIC_OWM_KEY in .env."
              : "Check your internet connection and try again."
          }
          onRetry={() => refetch()}
        />
      </LinearGradient>
    );
  }

  if (!data) return null;

  const { current, daily, timezone_offset } = data;
  const condition = current.weather[0];
  const night = isNightTime(current.dt, current.sunrise, current.sunset);
  const theme = getWeatherTheme(condition.id, night);
  const weatherKey = getWeatherKey(condition.icon);
  const emoji = WEATHER_EMOJI[weatherKey];

  return (
    <LinearGradient colors={theme.gradient} style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() => refetch()}
            tintColor="#ffffff"
          />
        }
      >
        {/* ── Header bar ── */}
        <View style={tw`flex-row items-center justify-between px-6 mb-6`}>
          <Pressable onPress={() => router.push("/cities")} hitSlop={12}>
            <Ionicons name="bookmark-outline" size={22} color="#ffffff" />
          </Pressable>
          <Text style={tw`text-white text-sm font-medium tracking-wide`}>
            My Location
          </Text>
          <Pressable onPress={() => router.push("/search")} hitSlop={12}>
            <Ionicons name="search-outline" size={22} color="#ffffff" />
          </Pressable>
        </View>

        {/* ── Hero ── */}
        <View style={tw`items-center px-6 mb-8`}>
          <Text style={{ fontSize: 72, lineHeight: 80 }}>{emoji}</Text>
          <Text
            style={[
              tw`text-white font-thin tracking-tight`,
              { fontSize: 96, lineHeight: 104 },
            ]}
          >
            {formatTemp(current.temp)}
          </Text>
          <Text style={tw`text-white text-2xl font-light capitalize mb-1`}>
            {condition.description}
          </Text>
          <Text style={tw`text-slate-300 text-sm`}>
            Feels like {formatTemp(current.feels_like)}
          </Text>
        </View>

        {/* ── Detail pills ── */}
        <View style={tw`flex-row mx-6 gap-3 mb-8`}>
          <DetailPill icon="water-outline" label="Humidity" value={`${current.humidity}%`} />
          <DetailPill
            icon="navigate-outline"
            label="Wind"
            value={`${Math.round(current.wind_speed)} m/s ${getWindDirection(current.wind_deg)}`}
          />
          <DetailPill icon="eye-outline" label="Visibility" value={`${Math.round((current.visibility ?? 0) / 1000)} km`} />
        </View>

        {/* ── UV + pressure row ── */}
        <View style={tw`flex-row mx-6 gap-3 mb-8`}>
          <DetailPill icon="sunny-outline" label="UV Index" value={String(Math.round(current.uvi))} />
          <DetailPill icon="speedometer-outline" label="Pressure" value={`${current.pressure} hPa`} />
          <DetailPill icon="thermometer-outline" label="Dew Point" value={formatTemp(current.dew_point)} />
        </View>

        {/* ── 5-day daily strip ── */}
        <View style={tw`mx-6`}>
          <Text style={tw`text-slate-400 text-xs font-semibold tracking-widest mb-3`}>
            5-DAY FORECAST
          </Text>
          {daily.slice(1, 6).map((day) => {
            const dayKey = getWeatherKey(day.weather[0].icon);
            const dayEmoji = WEATHER_EMOJI[dayKey];
            const dayLabel = new Date(
              (day.dt + timezone_offset) * 1000
            ).toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" });
            return (
              <View
                key={day.dt}
                style={tw`flex-row items-center justify-between py-3 border-b border-white/10`}
              >
                <Text style={tw`text-white text-sm w-10`}>{dayLabel}</Text>
                <Text style={{ fontSize: 20 }}>{dayEmoji}</Text>
                <Text style={tw`text-slate-400 text-sm`}>
                  {Math.round(day.temp.min)}°
                </Text>
                <Text style={tw`text-white text-sm font-medium`}>
                  {Math.round(day.temp.max)}°
                </Text>
              </View>
            );
          })}
        </View>
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
