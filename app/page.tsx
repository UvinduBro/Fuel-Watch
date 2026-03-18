"use client";

import { useState } from "react";
import { FilterBar } from "@/components/blocks/FilterBar";
import { StationCard } from "@/components/blocks/StationCard";
import { useStations } from "@/lib/hooks/useStations";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/blocks/MapComponent").then(m => m.MapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-full glass-panel flex flex-col items-center justify-center text-muted-foreground gap-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="text-sm font-medium">Initializing Map...</span></div>
});

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const { location, loading: geoLoading } = useGeolocation();
  const { stations, isLoading: stationsLoading } = useStations(location?.lat, location?.lng);

  // Filter logic
  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          station.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpen = showOpenOnly ? station.isOpen : true;
    return matchesSearch && matchesOpen;
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
      </header>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-8 flex flex-col gap-6">
        <FilterBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
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
            <h2 className="text-lg font-semibold flex items-center justify-between mt-4 lg:mt-0">
              Nearby Stations
              <span className="text-sm font-normal text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                {filteredStations.length} found
              </span>
            </h2>

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
