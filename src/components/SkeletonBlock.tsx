import { useEffect, useRef } from "react";
import { Animated, View, ViewStyle } from "react-native";

interface Props {
  width?: ViewStyle["width"];
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export default function SkeletonBlock({
  width = "100%",
  height = 20,
  borderRadius = 8,
  style,
}: Props) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: "#1E2D45",
          opacity,
        },
        style,
      ]}
    />
  );
}

export function HomeSkeleton() {
  return (
    <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: 80 }}>
      {/* location */}
      <SkeletonBlock width={140} height={16} style={{ marginBottom: 8 }} />
      {/* temp */}
      <SkeletonBlock width={200} height={80} style={{ marginBottom: 12, borderRadius: 16 }} />
      {/* condition */}
      <SkeletonBlock width={120} height={18} style={{ marginBottom: 32 }} />
      {/* details row */}
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 32 }}>
        <SkeletonBlock width="30%" height={64} borderRadius={12} />
        <SkeletonBlock width="30%" height={64} borderRadius={12} />
        <SkeletonBlock width="30%" height={64} borderRadius={12} />
      </View>
      {/* hourly strip */}
      <SkeletonBlock height={96} borderRadius={16} style={{ marginBottom: 16 }} />
      {/* forecast rows */}
      {[...Array(5)].map((_, i) => (
        <SkeletonBlock key={i} height={48} borderRadius={12} style={{ marginBottom: 8 }} />
      ))}
    </View>
  );
}
