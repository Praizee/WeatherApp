import { QueryClient } from "@tanstack/react-query";

const TEN_MINUTES = 10 * 60 * 1000;
const ONE_DAY = 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TEN_MINUTES,
      gcTime: ONE_DAY,
      retry: 2,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
  },
});
