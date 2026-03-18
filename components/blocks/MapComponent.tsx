"use client";

import { useMemo, useState } from "react";
import { StationData } from "./StationCard";
import { Coordinates } from "@/lib/hooks/useGeolocation";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF } from "@react-google-maps/api";
import { Loader2 } from "lucide-react";

interface MapProps {
  stations: StationData[];
  userLocation: Coordinates | null;
}

const libraries: "places"[] = ["places"];

export function MapComponent({ stations, userLocation }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [activeStation, setActiveStation] = useState<StationData | null>(null);

  const defaultCenter = useMemo(() => ({ lat: 6.9271, lng: 79.8612 }), []); // Colombo 
  const center = userLocation || defaultCenter;

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    scrollwheel: true,
    styles: [
      { elementType: "geometry", stylers: [{ color: "#212121" }] },
      { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
      { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
      { featureType: "administrative", elementType: "geometry", stylers: [{ color: "#757575" }] },
      { featureType: "administrative.country", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
      { featureType: "administrative.locality", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
      { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#181818" }] },
      { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { featureType: "poi.park", elementType: "labels.text.stroke", stylers: [{ color: "#1b1b1b" }] },
      { featureType: "road", elementType: "geometry.fill", stylers: [{ color: "#2c2c2c" }] },
      { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#8a8a8a" }] },
      { featureType: "road.arterial", elementType: "geometry", stylers: [{ color: "#373737" }] },
      { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#3c3c3c" }] },
      { featureType: "road.highway.controlled_access", elementType: "geometry", stylers: [{ color: "#4e4e4e" }] },
      { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
      { featureType: "transit", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
      { featureType: "water", elementType: "geometry", stylers: [{ color: "#000000" }] },
      { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#3d3d3d" }] },
    ],
  }), []);

  if (loadError) return <div className="w-full h-full flex items-center justify-center text-rose-500 font-medium">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="w-full h-full glass-panel flex flex-col items-center justify-center gap-3 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /><span>Loading Google Maps...</span></div>;

  return (
    <div className="w-full h-[300px] lg:h-[calc(100vh-250px)] rounded-3xl overflow-hidden glass-panel relative z-0 border border-white/10 shadow-2xl">
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "100%" }}
        center={center}
        zoom={13}
        options={mapOptions}
        onClick={() => setActiveStation(null)}
      >
        {userLocation && (
          <MarkerF
            position={userLocation}
            icon={{
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: "#3b82f6",
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
          />
        )}

        {stations.map(station => (
          <MarkerF
            key={station.id}
            position={{ lat: station.location.lat, lng: station.location.lng }}
            onClick={() => setActiveStation(station)}
            icon={{
              url: station.isNearest 
                ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
                : station.isOpen 
                  ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png" 
                  : "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
            }}
          />
        ))}

        {activeStation && (
          <InfoWindowF
            position={{ lat: activeStation.location.lat, lng: activeStation.location.lng }}
            onCloseClick={() => setActiveStation(null)}
          >
            <div className="text-black p-1 max-w-[200px]">
              <h3 className="font-extrabold text-sm mb-1 leading-tight">{activeStation.name}</h3>
              <p className="text-xs mb-2 opacity-80">{activeStation.address}</p>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${activeStation.isOpen ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                {activeStation.isOpen ? "OPEN" : "CLOSED"}
              </span>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}
