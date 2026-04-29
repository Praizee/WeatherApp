import tw from "@/src/lib/tw";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={tw`flex-1 items-center justify-center bg-slate-950`}>
      <Text style={tw`text-slate-100 text-lg`}>WeatherApp (jes scaffold)</Text>
      <Text style={tw`text-slate-400 text-sm mt-2`}>
        Phase 1 wires the data layer next.
      </Text>
    </View>
  );
}

