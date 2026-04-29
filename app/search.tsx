import { View, Text } from "react-native";
import tw from "@/src/lib/tw";

export default function SearchScreen() {
  return (
    <View style={tw`flex-1 bg-slate-950 items-center justify-center`}>
      <Text style={tw`text-white`}>Search — Phase 4</Text>
    </View>
  );
}
