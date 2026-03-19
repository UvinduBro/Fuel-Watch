"use client";

import { useState, useEffect } from "react";
import { FilterBar } from "@/components/blocks/FilterBar";
import { StationCard } from "@/components/blocks/StationCard";
import { useStations } from "@/lib/hooks/useStations";
import { useGeolocation } from "@/lib/hooks/useGeolocation";
import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { SettingsToggle } from "@/components/blocks/SettingsToggle";
import { useTranslation } from "@/lib/i18n/provider";

const MapComponent = dynamic(() => import("@/components/blocks/MapComponent").then(m => m.MapComponent), {
  ssr: false,
  loading: () => <div className="w-full h-full glass-panel flex flex-col items-center justify-center text-muted-foreground gap-4"><Loader2 className="w-8 h-8 animate-spin text-primary" /><span className="text-sm font-medium">Initializing Map...</span></div>
});

export default function Home() {
  const { t } = useTranslation();
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
    
    let matchesFuel = true;
    if (fuelFilter === "Petrol") {
      matchesFuel = station.fuels.petrol92.status !== "out" || station.fuels.petrol95.status !== "out";
    } else if (fuelFilter === "Diesel") {
      matchesFuel = station.fuels.diesel.status !== "out" || station.fuels.superDiesel.status !== "out";
    }

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
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px]" />
      </div>

      <header className="pt-12 pb-6 px-4 sm:px-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{t("app.title")}</h1>
          <p className="text-muted-foreground mt-1">{t("app.subtitle")}</p>
        </div>
        <div className="flex flex-col items-end gap-3 mt-4 sm:mt-0">
          <SettingsToggle />
          <div className="flex items-center gap-3">
            <Link href="/pass" className="px-5 py-2.5 bg-secondary/50 hover:bg-secondary rounded-xl text-sm font-bold transition-all border border-border shadow-sm flex items-center gap-2">
              {t("nav.walletPass")}
            </Link>
            <Link href="/schedule" className="px-5 py-2.5 bg-secondary/50 hover:bg-secondary rounded-xl text-sm font-bold transition-all border border-border shadow-sm flex items-center gap-2">
              {t("nav.fuelSchedule")}
            </Link>
            <Link href="/stations" className="px-5 py-2.5 bg-secondary/50 hover:bg-secondary rounded-xl text-sm font-bold transition-all border border-border shadow-sm flex items-center gap-2">
              {t("nav.allStations")}
            </Link>
          </div>
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
          <div className="lg:col-span-3 h-[400px] lg:h-[calc(100vh-250px)] lg:sticky lg:top-28">
            {geoLoading ? (
              <div className="w-full h-full glass-panel flex flex-col items-center justify-center text-muted-foreground gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="text-sm font-medium">{t("map.acquiring")}</span>
              </div>
            ) : (
              <MapComponent stations={filteredStations} userLocation={location} />
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 lg:mt-0">
              <h2 className="text-xl font-bold flex items-center gap-3">
                {t("home.nearbyStations")}
                <span className="text-xs font-semibold text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full border border-border">
                  {filteredStations.length} {t("home.found")}
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-2.5 mb-2 mt-1">
              <span className="text-xs font-bold text-muted-foreground">{t("filter.filter")}</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-full border border-border w-fit">
                  {[
                    { key: "All", label: t("fuel.all") },
                    { key: "Petrol", label: t("fuel.petrol") },
                    { key: "Diesel", label: t("fuel.diesel") },
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFuelFilter(f.key)}
                      className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${fuelFilter === f.key ? 'bg-background text-foreground shadow-sm border border-border' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="bg-muted border border-border rounded-xl px-3 py-1.5 text-xs font-bold text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 h-8 w-fit"
                >
                  <option value="All Availability">{t("availability.all")}</option>
                  <option value="Available">{t("availability.available")}</option>
                  <option value="Low Stock">{t("availability.lowStock")}</option>
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
                <p className="text-muted-foreground font-medium">{t("home.noStations")}</p>
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
