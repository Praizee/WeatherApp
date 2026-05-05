import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import HoverPressable from "@/src/components/HoverPressable";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBreakpoint } from "@/src/hooks/useBreakpoint";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from "@expo/vector-icons";
import tw from "@/src/lib/tw";
import { useCitySearch } from "@/src/hooks/useCitySearch";
import {
  useSavedCities,
  useAddCity,
  makeCityId,
} from "@/src/hooks/useSavedCities";
import type { GeoResult } from "@/src/types/owm";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { showSidebar } = useBreakpoint();
  const [input, setInput] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(input), 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]);

  const { data: results, isFetching, error } = useCitySearch(debouncedQuery);
  const { data: savedCities } = useSavedCities();
  const addCity = useAddCity();

  // Reset selection when results change
  useEffect(() => { setSelectedIndex(-1); }, [results]);

  // Arrow-key navigation for web/desktop
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const list = results ?? [];
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, list.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0 && list[selectedIndex]) {
        e.preventDefault();
        handleNavigate(list[selectedIndex]);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results, selectedIndex]);

  const savedIds = new Set((savedCities ?? []).map((c) => c.id));

  function handleAdd(result: GeoResult) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const id = makeCityId(result.lat, result.lon);
    addCity.mutate({
      id,
      name: result.name,
      country: result.country,
      state: result.state,
      lat: result.lat,
      lon: result.lon,
    });
  }

  function handleNavigate(result: GeoResult) {
    const id = makeCityId(result.lat, result.lon);
    const params = new URLSearchParams({ name: result.name, country: result.country });
    if (result.state) params.set("state", result.state);
    router.push(`/city/${id}?${params.toString()}`);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#0B1220" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ paddingTop: insets.top + 12, flex: 1 }}>
        {/* Header */}
        <View style={tw`flex-row items-center px-4 mb-4 gap-3`}>
          {!showSidebar && (
            <HoverPressable onPress={() => router.back()} accessibilityLabel="Go back">
              <Ionicons name="arrow-back" size={22} color="#fff" />
            </HoverPressable>
          )}
          <View
            style={[
              tw`flex-1 flex-row items-center rounded-2xl px-4 gap-2`,
              { backgroundColor: "rgba(255,255,255,0.08)", height: 48 },
            ]}
          >
            <Ionicons name="search-outline" size={18} color="#64748B" />
            <TextInput
              style={[tw`flex-1 text-white text-sm`, { paddingVertical: 0 }]}
              placeholder="Search for a city..."
              placeholderTextColor="#64748B"
              value={input}
              onChangeText={setInput}
              autoFocus
              returnKeyType="search"
              autoCorrect={false}
            />
            {input.length > 0 && (
              <Pressable onPress={() => { setInput(""); setDebouncedQuery(""); }} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color="#64748B" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Results feedback */}
        {isFetching && (
          <ActivityIndicator color="#4B6FA5" style={tw`mt-6`} />
        )}

        {!isFetching && error && (
          <View style={tw`items-center mt-10 px-8`}>
            <Ionicons name="wifi-outline" size={36} color="#1E2D45" style={tw`mb-3`} />
            <Text style={tw`text-slate-400 text-sm text-center`}>
              Couldn't search — check your internet connection and try again.
            </Text>
          </View>
        )}

        {!isFetching && !error && debouncedQuery.length >= 2 && results && results.length === 0 && (
          <View style={tw`items-center mt-10 px-8`}>
            <Ionicons name="search-outline" size={36} color="#1E2D45" style={tw`mb-3`} />
            <Text style={tw`text-slate-400 text-sm text-center`}>
              No cities found for "{debouncedQuery}". Try a different spelling or check the city name.
            </Text>
          </View>
        )}

        {debouncedQuery.length === 0 && (
          <View style={tw`items-center mt-10 px-8`}>
            <Ionicons name="earth-outline" size={36} color="#1E2D45" style={tw`mb-3`} />
            <Text style={tw`text-slate-400 text-sm text-center`}>
              Type at least 2 characters to search for a city.
            </Text>
          </View>
        )}

        <FlatList
          data={results ?? []}
          keyExtractor={(item) => `${item.lat}-${item.lon}`}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 16 }}
          renderItem={({ item, index }) => {
            const id = makeCityId(item.lat, item.lon);
            const isSaved = savedIds.has(id);
            const subtitle = [item.state, item.country].filter(Boolean).join(", ");
            const isKeySelected = selectedIndex === index;

            return (
              <HoverPressable
                onPress={() => handleNavigate(item)}
                accessibilityLabel={`View weather for ${item.name}`}
                style={[
                  tw`flex-row items-center justify-between py-4 border-b border-white/8`,
                  isKeySelected && { backgroundColor: "rgba(96,165,250,0.12)" },
                ]}
                pressStyle={{ opacity: 0.7 }}
                hoverStyle={{ backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                {() => (
                  <>
                    <View style={tw`flex-1 mr-4`}>
                      <Text style={tw`text-white text-base font-medium`}>{item.name}</Text>
                      {subtitle ? (
                        <Text style={tw`text-slate-400 text-xs mt-0.5`}>{subtitle}</Text>
                      ) : null}
                    </View>
                    <HoverPressable
                      onPress={() => handleAdd(item)}
                      disabled={isSaved}
                      accessibilityLabel={isSaved ? "Already saved" : `Save ${item.name}`}
                      hoverStyle={{ opacity: 0.7 }}
                    >
                      <Ionicons
                        name={isSaved ? "bookmark" : "bookmark-outline"}
                        size={20}
                        color={isSaved ? "#60A5FA" : "#64748B"}
                      />
                    </HoverPressable>
                  </>
                )}
              </HoverPressable>
            );
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
