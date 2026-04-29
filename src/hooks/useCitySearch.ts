import { useQuery } from "@tanstack/react-query";
import { geoSearch } from "@/src/api/owm";

const FIVE_MINUTES = 5 * 60 * 1000;

export function useCitySearch(query: string) {
  return useQuery({
    queryKey: ["geo", "search", query],
    queryFn: () => geoSearch(query),
    enabled: query.trim().length >= 2,
    staleTime: FIVE_MINUTES,
  });
}
