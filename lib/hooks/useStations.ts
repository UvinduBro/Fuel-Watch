import useSWR from "swr";
import { getStations } from "../firebase/db";
import { StationData } from "@/components/blocks/StationCard";

const fetcher = async (lat?: number, lng?: number, searchQuery?: string) => {
  // 1. Fetch Firestore updates (this now only contains stations with actual crowdsourced data)
  const firestoreStations = await getStations();
  
  // Helper to filter out LP Gas shops
  const isLPGas = (name: string) => /litro|laugfs|gas center|gas shop/i.test(name);
  
  // Helper to merge Google results with Firestore
  const mergeResults = (results: google.maps.places.PlaceResult[]) => {
      const validStations = results.filter(p => p.name && !isLPGas(p.name));
      return validStations.map(place => {
        const placeId = (place.place_id || place.name || "").replace(/\//g, "-");
        const fsData = firestoreStations.find(fs => fs.id === placeId || fs.name === place.name);
        
        return {
          id: placeId,
          name: place.name || "Unknown Station",
          address: place.vicinity || place.formatted_address || "Unknown Address",
          location: {
            lat: place.geometry?.location?.lat() || 0,
            lng: place.geometry?.location?.lng() || 0
          },
          isOpen: fsData?.isOpen ?? true,
          fuels: fsData?.fuels || {
            petrol92: { status: "none", lastUpdatedAt: "No Data" },
            petrol95: { status: "none", lastUpdatedAt: "No Data" },
            diesel: { status: "none", lastUpdatedAt: "No Data" },
            superDiesel: { status: "none", lastUpdatedAt: "No Data" }
          },
          queue: fsData?.queue,
          queueUpdatedAt: fsData?.queueUpdatedAt,
          updatedCount: fsData?.updatedCount || 0,
          distance: 0
        } as StationData;
      });
  };

  if (typeof window !== "undefined" && window.google) {
    const service = new window.google.maps.places.PlacesService(document.createElement('div'));

    // Dynamic Text Search (for "All Stations" page)
    if (searchQuery && searchQuery.trim().length > 0) {
        return new Promise<StationData[]>((resolve) => {
            service.textSearch({
                query: `${searchQuery} fuel station in Sri Lanka`
            }, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(mergeResults(results));
                } else {
                    resolve(firestoreStations); // Fallback
                }
            });
        });
    }

    // Proximity Nearby Search (for Map/Home page)
    if (lat && lng) {
        return new Promise<StationData[]>((resolve) => {
            service.nearbySearch({
                location: { lat, lng },
                radius: 10000,
                type: 'gas_station'
            }, (results, status) => {
                if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                    resolve(mergeResults(results));
                } else {
                    resolve(firestoreStations); // Fallback
                }
            });
        });
    }
  }

  return firestoreStations;
};

export function useStations(userLat?: number, userLng?: number, searchQuery?: string) {
  const { data, error, isLoading, mutate } = useSWR<StationData[]>(
    ["stations", userLat, userLng, searchQuery], 
    () => fetcher(userLat, userLng, searchQuery), 
    {
      revalidateOnFocus: true,
      refreshInterval: 60000,
    }
  );

  let stations = data || [];

  if (userLat && userLng) {
    stations = stations.map(station => {
      const R = 6371;
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

    if (stations.length > 0) {
      stations = [
        { ...stations[0], isNearest: true },
        ...stations.slice(1).map(s => ({ ...s, isNearest: false }))
      ];
    }
  } else {
    stations = stations.map(s => ({ ...s, distance: 0, isNearest: false })).sort((a, b) => a.name.localeCompare(b.name));
  }

  return { stations, isLoading, isError: error, mutate };
}
