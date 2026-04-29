import { useQuery } from "@tanstack/react-query";
import { reverseGeo } from "@/src/api/owm";

const ONE_HOUR = 60 * 60 * 1000;

export function useReverseGeo(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: ["geo", "reverse", { lat, lon }],
    queryFn: () => reverseGeo(lat!, lon!),
    enabled: lat !== null && lon !== null,
    staleTime: ONE_HOUR,
    select: (results) => {
      if (!results.length) return null;
      const r = results[0];
      return r.state ? `${r.name}, ${r.state}` : `${r.name}, ${r.country}`;
    },
  });
}
