"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCATION_ID,
  getLocation,
  type LocationId,
} from "@/lib/catalog";

const STORAGE_KEY = "fooody_location_v1";
const locationListeners = new Set<() => void>();

type LocationContextValue = {
  locationId: LocationId;
  location: ReturnType<typeof getLocation>;
  setLocationId: (id: LocationId) => void;
};

const LocationContext = createContext<LocationContextValue | null>(null);

function subscribeLocation(listener: () => void) {
  locationListeners.add(listener);
  return () => locationListeners.delete(listener);
}

function getLocationSnapshot() {
  try {
    return sessionStorage.getItem(STORAGE_KEY) ?? DEFAULT_LOCATION_ID;
  } catch {
    return DEFAULT_LOCATION_ID;
  }
}

function getLocationServerSnapshot() {
  return DEFAULT_LOCATION_ID;
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const stored = useSyncExternalStore(
    subscribeLocation,
    getLocationSnapshot,
    getLocationServerSnapshot,
  );
  const locationId = getLocation(stored).id as LocationId;

  const setLocationId = useCallback((id: LocationId) => {
    try {
      sessionStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* private mode */
    }
    locationListeners.forEach((listener) => listener());
  }, []);

  const value = useMemo(
    () => ({
      locationId,
      location: getLocation(locationId),
      setLocationId,
    }),
    [locationId, setLocationId],
  );

  return (
    <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used within LocationProvider");
  }
  return ctx;
}
