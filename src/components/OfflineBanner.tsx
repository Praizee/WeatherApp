import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNetworkStatus } from "@/src/hooks/useNetworkStatus";
import tw from "@/src/lib/tw";

const BANNER_HEIGHT = 40;

export default function OfflineBanner() {
  const { isConnected } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const totalHeight = BANNER_HEIGHT + insets.bottom;
  const translateY = useSharedValue(totalHeight);

  useEffect(() => {
    translateY.value = withTiming(isConnected ? totalHeight : 0, {
      duration: 320,
      easing: Easing.out(Easing.quad),
    });
  }, [isConnected, translateY, totalHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        animatedStyle,
        tw`absolute left-0 right-0 z-50`,
        {
          bottom: 0,
          height: totalHeight,
          backgroundColor: "#1E3A5F",
          justifyContent: "flex-start",
        },
      ]}
    >
      <View style={tw`flex-row items-center justify-center gap-2 pt-2`}>
        <Ionicons name="cloud-offline-outline" size={15} color="#93C5FD" />
        <Text style={tw`text-blue-200 text-xs font-medium`}>
          No internet connection — showing cached data
        </Text>
      </View>
    </Animated.View>
  );
}
