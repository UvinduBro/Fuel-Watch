import useSWR from "swr";
import { getStations } from "../firebase/db";
import { StationData } from "@/components/blocks/StationCard";

const fetcher = async () => {
  return await getStations();
};

export function useStations(userLat?: number, userLng?: number) {
  const { data, error, isLoading, mutate } = useSWR<StationData[]>("stations", fetcher, {
    revalidateOnFocus: true,
    refreshInterval: 60000, // Refresh every minute
  });

  let stations = data || [];

  if (userLat && userLng) {
    stations = stations.map(station => {
      // Basic Haversine distance mapping string/number gracefully
      const R = 6371; // km
      const lat1 = userLat;
      const lon1 = userLng;
      const lat2 = station.location?.lat || 0;
      const lon2 = station.location?.lng || 0;

      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180); 
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
      const distance = R * c;

      return { ...station, distance };
    }).sort((a, b) => (a.distance || 0) - (b.distance || 0));

    // Flag the nearest station
    if (stations.length > 0) {
      stations = [
        { ...stations[0], isNearest: true },
        ...stations.slice(1).map(s => ({ ...s, isNearest: false }))
      ];
    }
  } else {
    // If no explicit distance available, defaults are 0 and sorted by name
    stations = stations.map(s => ({ ...s, distance: 0, isNearest: false })).sort((a, b) => a.name.localeCompare(b.name));
  }

  return {
    stations,
    isLoading,
    isError: error,
    mutate
  };
}
