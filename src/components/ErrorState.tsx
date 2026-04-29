import { View, Text, Pressable } from "react-native";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/src/lib/tw";

interface Props {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  action?: { label: string; onPress: () => void };
}

export default function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
  icon = "cloud-offline-outline",
  action,
}: Props) {
  return (
    <View style={tw`flex-1 items-center justify-center px-8`}>
      <Ionicons name={icon} size={52} color="#4B6FA5" style={tw`mb-4`} />
      <Text style={tw`text-white text-xl font-semibold text-center mb-2`}>
        {title}
      </Text>
      <Text style={tw`text-slate-400 text-sm text-center leading-5 mb-6`}>
        {message}
      </Text>
      {onRetry && (
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onRetry();
          }}
          style={({ pressed }) =>
            tw`bg-blue-600 px-6 py-3 rounded-full mb-3 ${pressed ? "opacity-70" : ""}`
          }
        >
          <Text style={tw`text-white font-semibold text-sm`}>{retryLabel}</Text>
        </Pressable>
      )}
      {action && (
        <Pressable onPress={action.onPress}>
          <Text style={tw`text-blue-400 text-sm`}>{action.label}</Text>
        </Pressable>
      )}
    </View>
  );
}
