import { View, Text, FlatList, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/src/lib/tw";
import {
  useSavedCities,
  useRemoveCity,
  makeCityId,
} from "@/src/hooks/useSavedCities";
import SavedCityRow from "@/src/components/SavedCityRow";

export default function CitiesScreen() {
  const insets = useSafeAreaInsets();
  const { data: cities, isLoading } = useSavedCities();
  const removeCity = useRemoveCity();

  return (
    <View style={[tw`flex-1 bg-slate-950`, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={tw`flex-row items-center justify-between px-5 mb-6`}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </Pressable>
        <Text style={tw`text-white text-base font-semibold`}>Saved Cities</Text>
        <Pressable onPress={() => router.push("/search")} hitSlop={12}>
          <Ionicons name="add" size={26} color="#60A5FA" />
        </Pressable>
      </View>

      {/* Empty state */}
      {!isLoading && (!cities || cities.length === 0) && (
        <View style={tw`flex-1 items-center justify-center px-8`}>
          <Ionicons name="bookmark-outline" size={52} color="#1E2D45" style={tw`mb-4`} />
          <Text style={tw`text-white text-lg font-semibold mb-2`}>No saved cities</Text>
          <Text style={tw`text-slate-400 text-sm text-center mb-6`}>
            Search for a city and tap the bookmark icon to save it here.
          </Text>
          <Pressable
            onPress={() => router.push("/search")}
            style={tw`bg-blue-600 px-6 py-3 rounded-full`}
          >
            <Text style={tw`text-white font-semibold text-sm`}>Search cities</Text>
          </Pressable>
        </View>
      )}

      {/* List */}
      <FlatList
        data={cities ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 24,
        }}
        renderItem={({ item }) => (
          <SavedCityRow
            city={item}
            onPress={() => router.push(`/city/${makeCityId(item.lat, item.lon)}`)}
            onRemove={() => removeCity.mutate(item.id)}
          />
        )}
      />
    </View>
  );
}
