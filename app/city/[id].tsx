import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";
import tw from "@/src/lib/tw";

export default function CityDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View style={tw`flex-1 bg-slate-950 items-center justify-center`}>
      <Text style={tw`text-white`}>City {id} — Phase 4</Text>
    </View>
  );
}
