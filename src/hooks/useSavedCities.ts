import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const STORAGE_KEY = "saved-cities";

export interface SavedCity {
  id: string; // `${lat}_${lon}`
  name: string;
  country: string;
  state?: string;
  lat: number;
  lon: number;
}

async function readCities(): Promise<SavedCity[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as SavedCity[]) : [];
}

async function writeCities(cities: SavedCity[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}

export function makeCityId(lat: number, lon: number): string {
  return `${lat}_${lon}`;
}

export function parseCityId(id: string): { lat: number; lon: number } {
  const [lat, lon] = id.split("_").map(Number);
  return { lat, lon };
}

export function useSavedCities() {
  return useQuery<SavedCity[]>({
    queryKey: ["savedCities"],
    queryFn: readCities,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useAddCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (city: SavedCity) => {
      const current = await readCities();
      if (current.some((c) => c.id === city.id)) return current;
      const updated = [...current, city];
      await writeCities(updated);
      return updated;
    },
    onSuccess: (updated) => {
      qc.setQueryData<SavedCity[]>(["savedCities"], updated);
    },
  });
}

export function useRemoveCity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const current = await readCities();
      const updated = current.filter((c) => c.id !== id);
      await writeCities(updated);
      return updated;
    },
    onSuccess: (updated) => {
      qc.setQueryData<SavedCity[]>(["savedCities"], updated);
    },
  });
}
