import { useState, useEffect } from "react";
import * as Location from "expo-location";

export type LocationState =
  | { status: "loading" }
  | { status: "denied" }
  | { status: "error"; message: string }
  | { status: "ready"; lat: number; lon: number };

export function useDeviceLocation(): LocationState {
  const [state, setState] = useState<LocationState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function request() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;

        if (status !== Location.PermissionStatus.GRANTED) {
          setState({ status: "denied" });
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        if (cancelled) return;

        setState({
          status: "ready",
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
        });
      } catch (e) {
        if (cancelled) return;
        setState({
          status: "error",
          message: e instanceof Error ? e.message : "Could not get location",
        });
      }
    }

    request();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
