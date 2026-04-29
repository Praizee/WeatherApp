import Constants from "expo-constants";

const BASE_URL = "https://api.openweathermap.org";

function getKey(): string {
  const key =
    (Constants.expoConfig?.extra?.owmKey as string | undefined) ?? "";
  if (!key) {
    console.warn(
      "[OWM] EXPO_PUBLIC_OWM_KEY is not set. Add it to your .env file."
    );
  }
  return key;
}

export class WeatherApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "WeatherApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  params: Record<string, string | number>
): Promise<T> {
  const key = getKey();
  const query = new URLSearchParams({
    ...Object.fromEntries(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ),
    appid: key,
  });

  const url = `${BASE_URL}${path}?${query}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new WeatherApiError(
        res.status,
        (body as { message?: string }).message ?? res.statusText
      );
    }
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}
