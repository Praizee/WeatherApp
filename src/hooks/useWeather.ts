import { useQuery } from "@tanstack/react-query";
import { getOneCall } from "@/src/api/owm";

const THIRTY_MINUTES = 30 * 60 * 1000;

export function useWeather(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: ["weather", "onecall", { lat, lon }],
    queryFn: () => getOneCall(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: THIRTY_MINUTES,
  });
}
