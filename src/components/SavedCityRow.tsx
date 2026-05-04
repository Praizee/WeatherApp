import { useRef } from "react";
import { View, Text, Pressable, Platform } from "react-native";
import Swipeable from "react-native-gesture-handler/Swipeable";
import { MotiView } from "moti";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/src/lib/tw";
import { useWeather } from "@/src/hooks/useWeather";
import { getWeatherKey } from "@/src/lib/iconMap";
import { formatTemp } from "@/src/lib/weatherTheme";
import HoverPressable from "./HoverPressable";
import LottieWeatherIcon from "./LottieWeatherIcon";
import { useContextMenu } from "@/src/context/ContextMenuContext";
import { copyToClipboard } from "@/src/lib/clipboard";
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
  const { open: openMenu } = useContextMenu();

  const current = data?.current;
  const weatherKey = current ? getWeatherKey(current.weather[0].icon) : 'loading';
  const temp = current ? formatTemp(current.temp) : "--°";
  const description = current?.weather[0].description ?? "";

  function handleDelete() {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      swipeRef.current?.close();
    }
    onRemove();
  }

  const menuItems = [
    { label: 'View weather',   icon: 'cloud-outline',  onPress: onPress },
    { label: 'Copy city name', icon: 'copy-outline',   onPress: () => copyToClipboard(city.name) },
    { label: 'Remove city',    icon: 'trash-outline',  onPress: handleDelete, destructive: true },
  ];

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

  const cityInfo = (hovered = false) => (
    <>
      <View style={tw`flex-1`}>
        <Text style={tw`text-white text-base font-semibold`}>{city.name}</Text>
        <Text style={tw`text-slate-400 text-xs mt-0.5 capitalize`}>
          {description || [city.state, city.country].filter(Boolean).join(", ")}
        </Text>
      </View>
      <View style={tw`items-end flex-row items-center gap-3`}>
        {Platform.OS === 'web' && hovered && (
          <Pressable
            onPress={handleDelete}
            accessibilityLabel="Remove city"
            style={[tw`p-2 rounded-xl`, { backgroundColor: "rgba(239,68,68,0.15)" }]}
          >
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
          </Pressable>
        )}
        <View style={tw`items-end`}>
          <LottieWeatherIcon weatherKey={weatherKey} size={44} />
          <Text style={tw`text-white text-lg font-light`}>{temp}</Text>
        </View>
      </View>
    </>
  );

  return (
    <MotiView
      from={{ opacity: 0, translateX: 24 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ type: "timing", duration: 380, delay: index * 70 }}
    >
      {Platform.OS === 'web' ? (
        <HoverPressable
          onPress={onPress}
          onLongPress={() => openMenu(0, 0, menuItems)}
          onContextMenu={(e: any) => {
            e.preventDefault();
            openMenu(e.nativeEvent?.pageX ?? 0, e.nativeEvent?.pageY ?? 0, menuItems);
          }}
          accessibilityLabel={`View weather for ${city.name}`}
          style={[
            tw`flex-row items-center justify-between px-5 py-4 mb-2 rounded-2xl`,
            { backgroundColor: "rgba(255,255,255,0.07)" },
          ]}
          hoverStyle={{ backgroundColor: "rgba(255,255,255,0.11)" }}
          pressStyle={{ backgroundColor: "rgba(255,255,255,0.14)" }}
        >
          {({ hovered }) => cityInfo(hovered)}
        </HoverPressable>
      ) : (
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
            {cityInfo(false)}
          </Pressable>
        </Swipeable>
      )}
    </MotiView>
  );
}
