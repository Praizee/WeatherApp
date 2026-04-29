import AsyncStorage from "@react-native-async-storage/async-storage";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";

const ONE_DAY = 24 * 60 * 60 * 1000;

export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  throttleTime: 1_000,
  key: "weatherapp-query-cache",
});

export const persistOptions = {
  persister: asyncStoragePersister,
  maxAge: ONE_DAY,
  buster: "v1",
};
