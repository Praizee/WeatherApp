import { useEffect } from "react";
import { TextInput, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withSpring,
} from "react-native-reanimated";

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface Props {
  temp: number;
  fontSize?: number;
  color?: string;
}

export default function AnimatedTemp({
  temp,
  fontSize = 96,
  color = "#ffffff",
}: Props) {
  const sv = useSharedValue(temp);

  useEffect(() => {
    sv.value = withSpring(temp, { damping: 18, stiffness: 120 });
  }, [temp, sv]);

  const animatedProps = useAnimatedProps(() => ({
    text: `${Math.round(sv.value)}°`,
    defaultValue: `${Math.round(sv.value)}°`,
  }));

  return (
    <AnimatedTextInput
      animatedProps={animatedProps}
      editable={false}
      underlineColorAndroid="transparent"
      style={[
        styles.text,
        { fontSize, lineHeight: fontSize + 8, color },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: "100",
    letterSpacing: -2,
    textAlign: "center",
  },
});
