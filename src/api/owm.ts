import type { GeoResult, OneCallResponse } from "@/src/types/owm";
import { apiFetch } from "./client";

const UNITS = "metric";

export function getOneCall(lat: number, lon: number) {
  return apiFetch<OneCallResponse>("/data/3.0/onecall", {
    lat,
    lon,
    units: UNITS,
    exclude: "minutely,alerts",
  });
}

export function geoSearch(query: string, limit = 5) {
  return apiFetch<GeoResult[]>("/geo/1.0/direct", { q: query, limit });
}

export function reverseGeo(lat: number, lon: number, limit = 1) {
  return apiFetch<GeoResult[]>("/geo/1.0/reverse", { lat, lon, limit });
}
