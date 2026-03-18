"use client";

import { useState, useEffect } from "react";
import { FilterBar } from "@/components/blocks/FilterBar";
import { StationCard } from "@/components/blocks/StationCard";
import { useStations } from "@/lib/hooks/useStations";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";

const MapComponent = dynamic(() => import("@/components/blocks/MapComponent").then(m => m.MapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-full glass-panel flex flex-col items-center justify-center text-muted-foreground gap-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="text-sm font-medium">Initializing Map...</span></div>
});

export default function Home() {
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [fuelFilter, setFuelFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All Availability");

  // Location Picker logic
  const [locationName, setLocationName] = useState("Detecting...");
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [tempLocation, setTempLocation] = useState("");

  const { location, error: geoError, loading: geoLoading } = useGeolocation();

  useEffect(() => {
    if (location && window.google && !customLocation) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const cityObj = results[0].address_components.find(c => c.types.includes("locality") || c.types.includes("sublocality"));
          setLocationName(cityObj ? cityObj.short_name : "Nearby");
        } else {
          setLocationName("Unknown area");
        }
      });
    } else if (geoError && !customLocation) {
      setLocationName("Location disabled");
    } else if (!location && !geoLoading && !customLocation) {
      setLocationName("Sri Lanka");
    }
  }, [location, geoError, geoLoading, customLocation]);

  const activeLat = customLocation ? undefined : (location?.lat ? Math.round(location.lat * 10000) / 10000 : undefined);
  const activeLng = customLocation ? undefined : (location?.lng ? Math.round(location.lng * 10000) / 10000 : undefined);

  const { stations, isLoading: stationsLoading } = useStations(activeLat, activeLng, customLocation || undefined);

  // Filter logic
  const filteredStations = stations.filter(station => {
    const matchesOpen = showOpenOnly ? station.isOpen : true;
    
    // Fuel Type Filter
    let matchesFuel = true;
    if (fuelFilter === "Petrol") {
      matchesFuel = station.fuels.petrol92.status !== "out" || station.fuels.petrol95.status !== "out";
    } else if (fuelFilter === "Diesel") {
      matchesFuel = station.fuels.diesel.status !== "out" || station.fuels.superDiesel.status !== "out";
    }

    // Availability Filter
    let matchesAvailability = true;
    if (availabilityFilter !== "All Availability") {
      const hasAvailable = ["petrol92", "petrol95", "diesel", "superDiesel"].some(k => station.fuels[k as keyof typeof station.fuels].status === "available");
      const hasLow = ["petrol92", "petrol95", "diesel", "superDiesel"].some(k => station.fuels[k as keyof typeof station.fuels].status === "low");
      if (availabilityFilter === "Available") matchesAvailability = hasAvailable;
      if (availabilityFilter === "Low Stock") matchesAvailability = hasLow;
    }

    return matchesOpen && matchesFuel && matchesAvailability;
  });

  return (
    <main className="min-h-screen pb-20 relative">
      {/* Abstract Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="pt-12 pb-6 px-4 sm:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Fuel Watch</h1>
          <p className="text-muted-foreground mt-1">Real-time crowdsourced fuel availability</p>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Link href="/pass" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10 hover:border-white/20 shadow-sm flex items-center gap-2">
            Wallet Pass
          </Link>
          <Link href="/schedule" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10 hover:border-white/20 shadow-sm flex items-center gap-2">
            Fuel Schedule
          </Link>
          <Link href="/stations" className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-bold transition-all border border-white/10 hover:border-white/20 shadow-sm flex items-center gap-2">
            All Stations
          </Link>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col gap-6">
        <FilterBar
          locationName={locationName}
          customLocation={customLocation}
          tempLocation={tempLocation}
          setTempLocation={setTempLocation}
          isEditingLocation={isEditingLocation}
          setIsEditingLocation={setIsEditingLocation}
          setCustomLocation={setCustomLocation}
          showOpenOnly={showOpenOnly}
          setShowOpenOnly={setShowOpenOnly}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Map Column */}
          <div className="lg:col-span-3 h-[400px] lg:h-[calc(100vh-250px)] lg:sticky lg:top-28">
            {geoLoading ? (
              <div className="w-full h-full glass-panel flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">Acquiring position...</span>
              </div>
            ) : (
              <MapComponent stations={filteredStations} userLocation={location} />
            )}
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 lg:mt-0">
              <h2 className="text-xl font-bold flex items-center gap-3">
                Nearby Stations
                <span className="text-xs font-semibold text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {filteredStations.length} found
                </span>
              </h2>
            </div>

            {/* List Filters */}
            <div className="flex flex-col gap-2.5 mb-2 mt-1">
              <span className="text-xs font-bold text-muted-foreground">Filter</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-black/20 p-1 rounded-full border border-white/5 w-fit">
                  {["All", "Petrol", "Diesel"].map(f => (
                    <button
                      key={f}
                      onClick={() => setFuelFilter(f)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${fuelFilter === f ? 'bg-white/10 text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-white/5'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 h-8 w-fit"
                >
                  <option value="All Availability">All Availability</option>
                  <option value="Available">Available</option>
                  <option value="Low Stock">Low Stock</option>
                </select>
              </div>
            </div>

            {stationsLoading ? (
              <div className="flex flex-col gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 glass-card rounded-2xl animate-pulse bg-white/5 border border-white/5" />
                ))}
              </div>
            ) : filteredStations.length === 0 ? (
              <div className="glass-panel p-8 text-center flex flex-col items-center justify-center border-dashed border-white/20">
                <p className="text-muted-foreground font-medium">No stations found matching your criteria.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4 h-full lg:overflow-y-auto pb-10 custom-scrollbar">
                {filteredStations.map(station => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
