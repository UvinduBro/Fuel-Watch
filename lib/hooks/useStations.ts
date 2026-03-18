import useSWR from "swr";
import { getStations } from "../firebase/db";
import { StationData } from "@/components/blocks/StationCard";

const fetcher = async (lat?: number, lng?: number) => {
  // 1. Fetch Firestore updates (this now only contains stations with actual crowdsourced data)
  const firestoreStations = await getStations();
  
  // 2. If we have location, we can try to "Discover" from Google locally if needed or just rely on what's in DB.
  // BUT the user specifically asked for "Google Places API -> base dataset".
  // So we should ideally fetch from Google AND merge.
  
  if (lat && lng && typeof window !== "undefined" && window.google) {
    return new Promise<StationData[]>((resolve) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      service.nearbySearch({
        location: { lat, lng },
        radius: 10000,
        type: 'gas_station'
      }, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          const hybridStations = results.map(place => {
            const placeId = place.place_id || place.name || "";
            // Find if we have firestore data for this place
            const fsData = firestoreStations.find(fs => fs.id === placeId || fs.name === place.name);
            
            return {
              id: placeId,
              name: place.name || "Unknown Station",
              address: place.vicinity || "Unknown Address",
              location: {
                lat: place.geometry?.location?.lat() || 0,
                lng: place.geometry?.location?.lng() || 0
              },
              isOpen: fsData?.isOpen ?? true,
              fuels: fsData?.fuels || {
                petrol92: { status: "out", lastUpdatedAt: "No Data" },
                petrol95: { status: "out", lastUpdatedAt: "No Data" },
                diesel: { status: "out", lastUpdatedAt: "No Data" },
                superDiesel: { status: "out", lastUpdatedAt: "No Data" }
              },
              queue: fsData?.queue,
              queueUpdatedAt: fsData?.queueUpdatedAt,
              updatedCount: fsData?.updatedCount || 0,
              distance: 0 // Will be calculated below
            } as StationData;
          });
          resolve(hybridStations);
        } else {
          resolve(firestoreStations);
        }
      });
    });
  }

  return firestoreStations;
};

export function useStations(userLat?: number, userLng?: number) {
  const { data, error, isLoading, mutate } = useSWR<StationData[]>(
    userLat && userLng ? ["stations", userLat, userLng] : "stations", 
    () => fetcher(userLat, userLng), 
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
