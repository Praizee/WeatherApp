import { useEffect } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { queryClient } from "@/src/query/client";
import { persistOptions } from "@/src/query/persister";
import { bootstrapNetInfo } from "@/src/lib/netStatus";
import OfflineBanner from "@/src/components/OfflineBanner";
import Sidebar from "@/src/components/Sidebar";
import KeyboardShortcuts from "@/src/components/KeyboardShortcuts";
import ContextMenuOverlay from "@/src/components/ContextMenu";
import { ContextMenuProvider } from "@/src/context/ContextMenuContext";
import { useBreakpoint } from "@/src/hooks/useBreakpoint";

function AppShell() {
  const { showSidebar, isTablet } = useBreakpoint();


  return (
    <ContextMenuProvider>
      <KeyboardShortcuts />
      <View style={{ flex: 1, flexDirection: "row" }}>
        {showSidebar && <Sidebar collapsed={isTablet} />}
        <View style={{ flex: 1 }}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#0B1220" },
              animation: "slide_from_right",
            }}
          />
          <OfflineBanner sidebarVisible={showSidebar} />
        </View>
      </View>
      <ContextMenuOverlay />
    </ContextMenuProvider>
  );
}

export default function RootLayout() {
  useEffect(() => {
    bootstrapNetInfo();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={persistOptions}
        >
          <AppShell />
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
