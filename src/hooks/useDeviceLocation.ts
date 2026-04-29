import * as Location from "expo-location";
import { useEffect, useState } from "react";

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

        // Try last known first incase getCurrentPositionAsync is null.
        const last = await Location.getLastKnownPositionAsync({
          maxAge: 5 * 60 * 1000, // accept positions up to 5 min old
          requiredAccuracy: 5000, // accept up to 5 km accuracy
        }).catch(() => null);

        if (last && !cancelled) {
          setState({
            status: "ready",
            lat: last.coords.latitude,
            lon: last.coords.longitude,
          });
          return;
        }

        // lower accuracy to maximise emulator compatibility
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Lowest,
        });
        if (cancelled) return;

        setState({
          status: "ready",
          lat: loc.coords.latitude,
          lon: loc.coords.longitude,
        });
      } catch (e) {
        if (cancelled) return;
        const raw = e instanceof Error ? e.message : "Could not get location";
        // friendlier message for the common "services disabled" case
        const message = raw.toLowerCase().includes("unavailable")
          ? "Location services are disabled. Enable them in device settings, or search for a city manually."
          : raw;
        setState({ status: "error", message });
      }
    }

    request();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

