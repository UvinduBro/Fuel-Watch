"use client";

import { useMemo, useState } from "react";
import { StationData } from "./StationCard";
import { Coordinates } from "@/lib/hooks/useGeolocation";
import { GoogleMap, useLoadScript, MarkerF, InfoWindowF, MarkerClustererF, HeatmapLayerF } from "@react-google-maps/api";
import { Loader2, Layers, Binary } from "lucide-react";
import { useTheme } from "@/lib/theme/provider";
import { cn } from "@/lib/utils";

interface MapProps {
  stations: StationData[];
  userLocation: Coordinates | null;
}

const libraries: ("places" | "visualization")[] = ["places", "visualization"];

const darkStyles = [
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
];

const lightStyles = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f5f5f5" }] },
  { featureType: "administrative.land_parcel", elementType: "labels.text.fill", stylers: [{ color: "#bdbdbd" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "poi.park", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.arterial", elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { featureType: "road.highway", elementType: "geometry", stylers: [{ color: "#dadada" }] },
  { featureType: "road.highway", elementType: "labels.text.fill", stylers: [{ color: "#616161" }] },
  { featureType: "road.local", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
  { featureType: "transit.line", elementType: "geometry", stylers: [{ color: "#e5e5e5" }] },
  { featureType: "transit.station", elementType: "geometry", stylers: [{ color: "#eeeeee" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#c9c9c9" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#9e9e9e" }] },
];

export function MapComponent({ stations, userLocation }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const { resolvedTheme } = useTheme();
  const [activeStation, setActiveStation] = useState<StationData | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showClustering, setShowClustering] = useState(true);

  const defaultCenter = useMemo(() => ({ lat: 6.9271, lng: 79.8612 }), []); // Colombo 
  const center = userLocation || defaultCenter;

  const mapOptions = useMemo(() => ({
    disableDefaultUI: true,
    clickableIcons: false,
    scrollwheel: true,
    styles: resolvedTheme === "dark" ? darkStyles : lightStyles,
  }), [resolvedTheme]);

  // Prepare heatmap data based on open stations with fuel
  const heatmapData = useMemo(() => {
    return stations
      .filter(s => s.isOpen && s.location)
      .map(s => new google.maps.LatLng(s.location!.lat, s.location!.lng));
  }, [stations]);

  if (loadError) return <div className="w-full h-full flex items-center justify-center text-rose-500 font-medium">Error loading maps. Check your API key.</div>;
  if (!isLoaded) return <div className="w-full h-full glass-panel flex flex-col items-center justify-center gap-3 text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin" /><span>Loading Google Maps...</span></div>;

  // Only render stations with valid non-zero coordinates to prevent map crashes
  const mappableStations = stations.filter(
    s => s.location && typeof s.location.lat === "number" && typeof s.location.lng === "number" 
      && (s.location.lat !== 0 || s.location.lng !== 0)
  );

  return (
    <div className="w-full h-[300px] lg:h-[calc(100vh-250px)] rounded-3xl overflow-hidden glass-panel relative z-0 border border-border shadow-2xl">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={() => setShowClustering(!showClustering)}
          className={cn(
            "p-3 rounded-2xl border backdrop-blur-md transition-all",
            showClustering 
              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" 
              : "bg-background/80 text-foreground border-border hover:bg-background"
          )}
          title="Toggle Clustering"
        >
          <Binary className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowHeatmap(!showHeatmap)}
          className={cn(
            "p-3 rounded-2xl border backdrop-blur-md transition-all",
            showHeatmap 
              ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" 
              : "bg-background/80 text-foreground border-border hover:bg-background"
          )}
          title="Toggle Heatmap"
        >
          <Layers className="w-5 h-5" />
        </button>
      </div>

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

        {showHeatmap && (
          <HeatmapLayerF
            data={heatmapData}
            options={{
              radius: 40,
              opacity: 0.6,
            }}
          />
        )}

        {!showHeatmap && (
          showClustering ? (
            <MarkerClustererF>
              {(clusterer) => (
                <>
                  {mappableStations.map(station => (
                    <MarkerF
                      key={station.id}
                      position={{ lat: station.location?.lat || 0, lng: station.location?.lng || 0 }}
                      clusterer={clusterer}
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
                </>
              )}
            </MarkerClustererF>
          ) : (
            mappableStations.map(station => (
              <MarkerF
                key={station.id}
                position={{ lat: station.location?.lat || 0, lng: station.location?.lng || 0 }}
                onClick={() => setActiveStation(station)}
                icon={{
                  url: station.isNearest 
                    ? "https://maps.google.com/mapfiles/ms/icons/blue-dot.png" 
                    : station.isOpen 
                      ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png" 
                      : "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                }}
              />
            ))
          )
        )}

        {activeStation && activeStation.location && (
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
