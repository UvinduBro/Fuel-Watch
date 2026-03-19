"use client";

import { useAuth, signOut } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, LogOut, Plus, Trash2, Power, Map, Globe, AlertCircle, TrendingUp, Activity, Fuel, RefreshCw } from "lucide-react";
import { useStations } from "@/lib/hooks/useStations";
import { cn } from "@/lib/utils";
import { toggleStationStatus, getRecentUpdates, getAnalyticsSummary } from "@/lib/firebase/db";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, deleteDoc, doc } from "firebase/firestore";
import { useLoadScript } from "@react-google-maps/api";
import { StatusChart, MiniBarChart } from "@/components/admin/StatsCharts";
import { AnalyticsTab } from "@/components/admin/AnalyticsTab";

interface AnalyticsSummary {
  totalStations: number;
  totalUpdates: number;
  distribution: {
    [key: string]: { available: number; low: number; out: number; none: number };
  };
}

interface FuelUpdate {
  id: string;
  stationId: string;
  fuelType?: string;
  status?: string;
  queueStatus?: string;
  userId: string;
  createdAt: string;
}
const libraries: "places"[] = ["places"];

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { stations, isLoading, mutate } = useStations();
  
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string,
    libraries,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newStation, setNewStation] = useState({ name: "", address: "", lat: "", lng: "" });
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isIslandScanning, setIsIslandScanning] = useState(false);
  
  // Analytics State
  const [activeTab, setActiveTab ] = useState<"overview" | "stations" | "history" | "analytics">("overview");
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [recentUpdates, setRecentUpdates] = useState<FuelUpdate[]>([]);
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchAnalytics = async () => {
        setLoadingAnalytics(true);
        const [sum, updates] = await Promise.all([
          getAnalyticsSummary(),
          getRecentUpdates(50)
        ]);
        setAnalytics(sum as AnalyticsSummary);
        setRecentUpdates(updates as FuelUpdate[]);
        setLoadingAnalytics(false);
      };
      fetchAnalytics();
    }
  }, [user, stations]); // Re-fetch on station updates too

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const handleToggleOpen = async (stationId: string, currentStatus: boolean) => {
    await toggleStationStatus(stationId, !currentStatus);
    mutate();
  };

  const handleAddStation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStation.name || !newStation.address || !newStation.lat || !newStation.lng) return;

    try {
      const defaultFuels = {
        petrol92: { status: "available" as const, lastUpdatedAt: "Just now" },
        petrol95: { status: "available" as const, lastUpdatedAt: "Just now" },
        diesel: { status: "available" as const, lastUpdatedAt: "Just now" },
        superDiesel: { status: "available" as const, lastUpdatedAt: "Just now" }
      };

      await addDoc(collection(db, "stations"), {
        name: newStation.name,
        address: newStation.address,
        location: { lat: parseFloat(newStation.lat), lng: parseFloat(newStation.lng) },
        isOpen: true,
        fuels: defaultFuels,
        updatedCount: 0
      });
      setShowAddForm(false);
      setNewStation({ name: "", address: "", lat: "", lng: "" });
      mutate();
    } catch (e) {
      console.error(e);
      alert("Error adding station");
    }
  };

  const handleDeleteStation = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      await deleteDoc(doc(db, "stations", id));
      mutate();
    }
  };

  const handleClearCache = async () => {
    if (window.confirm("This will clear the application's data cache. The next request to public pages may be slightly slower while the cache rebuilds. Proceed?")) {
      try {
        const res = await fetch("/api/revalidate", { method: "POST" });
        const data = await res.json();
        if (data.revalidated) {
          alert("Application cache cleared successfully!");
        } else {
          alert("Error clearing cache: " + data.message);
        }
      } catch (err) {
        console.error(err);
        alert("Failed to clear cache.");
      }
    }
  };

  const discoverStations = async () => {
    if (!isLoaded || !window.google) {
      alert("Google Places API is loading or unavailable. Check API keys and ensure billing is enabled.");
      return;
    }

    setIsDiscovering(true);

    const runPlacesSearch = (location: google.maps.LatLng) => {
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      
      const request = {
        location,
        radius: 10000, // 10km radius
        type: "gas_station"
      };

      service.nearbySearch(request, async (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          let added = 0;
          for (const place of results) {
            if (!place.name || !place.geometry?.location) continue;
            
            // Deduplicate logic
            const placeLat = place.geometry.location.lat();
            const placeLng = place.geometry.location.lng();
            
            const exists = stations.some(s => 
              s.name.toLowerCase() === place.name!.toLowerCase() || 
              (Math.abs(s.location.lat - placeLat) < 0.001 && Math.abs(s.location.lng - placeLng) < 0.001)
            );

            if (!exists) {
              const defaultFuels = {
                petrol92: { status: "available" as const, lastUpdatedAt: "Just now" },
                petrol95: { status: "available" as const, lastUpdatedAt: "Just now" },
                diesel: { status: "available" as const, lastUpdatedAt: "Just now" },
                superDiesel: { status: "available" as const, lastUpdatedAt: "Just now" }
              };

              await addDoc(collection(db, "stations"), {
                name: place.name,
                address: place.vicinity || "Unknown Location",
                location: { lat: placeLat, lng: placeLng },
                isOpen: true,
                fuels: defaultFuels,
                updatedCount: 0
              });
              added++;
            }
          }
          alert(`Success! Discovered and imported ${added} new missing stations.`);
          mutate();
        } else {
          alert(`Search failed or no nearby stations found. Status: ${status}`);
        }
        setIsDiscovering(false);
      });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => runPlacesSearch(new window.google.maps.LatLng(pos.coords.latitude, pos.coords.longitude)),
        () => runPlacesSearch(new window.google.maps.LatLng(6.9271, 79.8612)) // Fallback to Colombo
      );
    } else {
      runPlacesSearch(new window.google.maps.LatLng(6.9271, 79.8612));
    }
  };

  const runIslandScan = async () => {
    if (!isLoaded || !window.google) return alert("Google Maps API not loaded");
    if (!window.confirm("This will perform a massive scan across 10 major cities in Sri Lanka and may consume a significant amount of Google Places API quota. Proceed?")) return;

    setIsIslandScanning(true);
    let totalAdded = 0;
    
    // Grid of major SL cities to get comprehensive island coverage
    const cities = [
      { name: "Colombo", lat: 6.9271, lng: 79.8612 },
      { name: "Kandy", lat: 7.2906, lng: 80.6337 },
      { name: "Galle", lat: 6.0535, lng: 80.2210 },
      { name: "Jaffna", lat: 9.6615, lng: 80.0255 },
      { name: "Anuradhapura", lat: 8.3114, lng: 80.4037 },
      { name: "Trincomalee", lat: 8.5811, lng: 81.2330 },
      { name: "Batticaloa", lat: 7.7170, lng: 81.6985 },
      { name: "Kurunegala", lat: 7.4818, lng: 80.3609 },
      { name: "Ratnapura", lat: 6.7056, lng: 80.3847 },
      { name: "Badulla", lat: 6.9934, lng: 81.0550 }
    ];

    const service = new window.google.maps.places.PlacesService(document.createElement('div'));
    
    for (const city of cities) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Delay to prevent OVER_QUERY_LIMIT
      
      const request = {
        location: new window.google.maps.LatLng(city.lat, city.lng),
        radius: 50000, // Max Places API radius (50km)
        type: "gas_station"
      };

      try {
        await new Promise<void>((resolve) => {
          service.nearbySearch(request, async (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              for (const place of results) {
                if (!place.name || !place.geometry?.location) continue;
                
                const placeLat = place.geometry.location.lat();
                const placeLng = place.geometry.location.lng();
                
                const exists = stations.some(s => 
                  s.name.toLowerCase() === place.name!.toLowerCase() || 
                  (Math.abs(s.location.lat - placeLat) < 0.001 && Math.abs(s.location.lng - placeLng) < 0.001)
                );

                if (!exists) {
                  const defaultFuels = {
                    petrol92: { status: "available" as const, lastUpdatedAt: "Just now" },
                    petrol95: { status: "available" as const, lastUpdatedAt: "Just now" },
                    diesel: { status: "available" as const, lastUpdatedAt: "Just now" },
                    superDiesel: { status: "available" as const, lastUpdatedAt: "Just now" }
                  };

                  await addDoc(collection(db, "stations"), {
                    name: place.name,
                    address: place.vicinity || "Unknown Location",
                    location: { lat: placeLat, lng: placeLng },
                    isOpen: true,
                    fuels: defaultFuels,
                    updatedCount: 0
                  });
                  totalAdded++;
                }
              }
            }
            resolve();
          });
        });
      } catch (err) {
        console.error("Scan error at " + city.name, err);
      }
    }
    
    alert(`Island Scan Complete! Added ${totalAdded} new stations to the database.`);
    setIsIslandScanning(false);
    mutate();
  };

  return (
    <main className="min-h-screen pb-20 p-4 sm:p-8 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-white/10 pb-8 mt-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
            <div className="flex items-center gap-6 mt-4">
              {[
                { id: "overview", label: "Overview" },
                { id: "stations", label: "Stations" },
                { id: "history", label: "History" },
                { id: "analytics", label: "Analytics" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "overview" | "stations" | "history" | "analytics")}
                  className={cn(
                    "pb-2 text-sm font-bold transition-all border-b-2",
                    activeTab === tab.id 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={signOut}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-semibold transition-colors border border-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </header>

        {activeTab === "overview" && (
          <section className="flex flex-col gap-8 animate-in fade-in duration-500">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Total Stations", value: analytics?.totalStations || 0, icon: Map, color: "text-blue-500" },
                { label: "Total Reports", value: analytics?.totalUpdates || 0, icon: TrendingUp, color: "text-emerald-500" },
                { label: "Live Updates", value: recentUpdates.length, icon: Activity, color: "text-purple-500" },
                { label: "Avg Updates/Station", value: analytics?.totalStations ? (analytics.totalUpdates / analytics.totalStations).toFixed(1) : 0, icon: Fuel, color: "text-amber-500" },
              ].map((stat, i) => (
                <div key={i} className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <stat.icon className={cn("w-5 h-5", stat.color)} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status: Live</span>
                  </div>
                  <div className="text-3xl font-black mt-2">{stat.value}</div>
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold px-1">Fuel Availability</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {analytics?.distribution && (
                    <>
                      <StatusChart label="Petrol 92" data={analytics.distribution.petrol92} />
                      <StatusChart label="Petrol 95" data={analytics.distribution.petrol95} />
                      <StatusChart label="Diesel" data={analytics.distribution.diesel} />
                      <StatusChart label="Super Diesel" data={analytics.distribution.superDiesel} />
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-bold px-1">Network Activity</h2>
                <MiniBarChart 
                  data={[12, 18, 15, 25, 32, 28, 40]} 
                  labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} 
                />
              </div>
            </div>
          </section>
        )}

        {activeTab === "stations" && (
          <section className="flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 shadow-inner">
              <h2 className="text-xl font-bold tracking-tight px-2 flex items-center gap-3">
                Registered Stations 
                <span className="text-xs px-2.5 py-1 bg-white/10 text-white rounded-full font-mono">{stations.length}</span>
              </h2>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <button 
                  onClick={discoverStations}
                  disabled={isDiscovering || isIslandScanning || !isLoaded}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-bold hover:bg-white/20 transition-all border border-white/20 disabled:opacity-50"
                >
                  {isDiscovering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Map className="w-4 h-4" />} 
                  {isDiscovering ? "Scanning..." : "Scan Nearby"}
                </button>
                <button 
                  onClick={runIslandScan}
                  disabled={isIslandScanning || isDiscovering || !isLoaded}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 text-sm font-bold hover:bg-purple-500/30 transition-all disabled:opacity-50"
                >
                  {isIslandScanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />} 
                  {isIslandScanning ? "Sweeping Island..." : "Island-Wide Scan"}
                </button>
                <button 
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all shadow-xl"
                >
                  <Plus className="w-4 h-4" /> Add Manual
                </button>
              </div>
            </div>

            {showAddForm && (
              <form onSubmit={handleAddStation} className="glass-panel p-8 rounded-3xl flex flex-col sm:flex-row gap-5 flex-wrap items-end border border-white/10 animate-in fade-in slide-in-from-top-4 shadow-2xl">
                <div className="flex flex-col gap-2.5 w-full sm:w-auto flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Name</label>
                  <input required className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" value={newStation.name} onChange={e => setNewStation({...newStation, name: e.target.value})} placeholder="E.g. CEpetco Townplace" />
                </div>
                <div className="flex flex-col gap-2.5 w-full sm:w-auto flex-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Address</label>
                  <input required className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" value={newStation.address} onChange={e => setNewStation({...newStation, address: e.target.value})} placeholder="123 Main St, City" />
                </div>
                <div className="flex flex-col gap-2.5 w-[calc(50%-0.625rem)] sm:w-28">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Latitude</label>
                  <input required type="number" step="any" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" value={newStation.lat} onChange={e => setNewStation({...newStation, lat: e.target.value})} placeholder="6.92" />
                </div>
                <div className="flex flex-col gap-2.5 w-[calc(50%-0.625rem)] sm:w-28">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Longitude</label>
                  <input required type="number" step="any" className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" value={newStation.lng} onChange={e => setNewStation({...newStation, lng: e.target.value})} placeholder="79.86" />
                </div>
                <button type="submit" className="px-8 py-3 bg-white text-black font-extrabold tracking-wide text-sm rounded-xl hover:bg-neutral-200 transition-all w-full sm:w-auto mt-2 sm:mt-0 shadow-xl">
                  Save
                </button>
              </form>
            )}

            {isLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="glass-panel overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-black/40 text-muted-foreground uppercase text-xs font-bold tracking-wider border-b border-white/10">
                      <tr>
                        <th className="px-6 py-5">Station Info</th>
                        <th className="px-6 py-5">Global Status</th>
                        <th className="px-6 py-5">Coordinates</th>
                        <th className="px-6 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {stations.map(station => (
                        <tr key={station.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="font-bold text-base text-foreground tracking-tight">{station.name}</div>
                            <div className="text-muted-foreground font-medium text-xs mt-1 truncate max-w-[300px]">{station.address}</div>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => handleToggleOpen(station.id, station.isOpen)}
                              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold border ${station.isOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20"} transition-all`}
                            >
                              <Power className="w-3 h-3" /> {station.isOpen ? "OPEN" : "CLOSED"}
                            </button>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-medium text-muted-foreground">
                            {station.location?.lat.toFixed(4)}, {station.location?.lng.toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button 
                              onClick={() => handleDeleteStation(station.id)}
                              className="p-2.5 rounded-xl text-rose-500/70 hover:text-rose-500 hover:bg-rose-500/10 focus:outline-none focus:ring-2 focus:ring-rose-500/40 transition-all opacity-50 group-hover:opacity-100"
                              title="Delete Station"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === "history" && (
          <section className="glass-panel overflow-hidden animate-in fade-in duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-black/40 text-muted-foreground uppercase text-xs font-bold tracking-wider border-b border-white/10">
                  <tr>
                    <th className="px-6 py-5 border-b border-white/10">Time</th>
                    <th className="px-6 py-5 border-b border-white/10">Station Name/ID</th>
                    <th className="px-6 py-5 border-b border-white/10">Type</th>
                    <th className="px-6 py-5 border-b border-white/10">Value</th>
                    <th className="px-6 py-5 border-b border-white/10">User</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentUpdates.map((update, i) => (
                    <tr key={update.id || i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs">
                        {new Date(update.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-xs truncate max-w-[200px]">
                        {stations.find(s => s.id === update.stationId)?.name || update.stationId.substring(0, 15) + "..."}
                      </td>
                      <td className="px-6 py-4 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
                        {update.fuelType || "Queue"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                          update.status === "available" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                          update.status === "low" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                          update.status === "out" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                          "bg-white/5 text-muted-foreground border-white/10"
                        )}>
                          {(update.status || update.queueStatus || "NONE").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {update.userId?.substring(0, 8)}...
                      </td>
                    </tr>
                  ))}
                  {recentUpdates.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">
                        No recent activity recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "analytics" && (
          <AnalyticsTab />
        )}

        <section className="mt-12 pt-8 border-t border-rose-500/20">
          <div className="flex flex-col gap-6">
            <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-rose-500 flex items-center gap-2 justify-center sm:justify-start">
                  <AlertCircle className="w-5 h-5" /> Dangerous Zone
                </h2>
                <p className="text-muted-foreground text-sm font-medium mt-1">
                  Permanently clear all crowdsourced fuel levels, queue status, and update logs.
                </p>
              </div>
              <button 
                onClick={async () => {
                  if (window.confirm("CRITICAL ACTION: This will permanently wipe all station updates and history. This cannot be undone. Proceed?")) {
                      try {
                          await import("@/lib/firebase/db").then(m => m.clearAllStationData());
                          alert("Database cleared successfully.");
                          mutate();
                      } catch {
                          alert("Error clearing data.");
                      }
                  }
                }}
                className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <Trash2 className="w-4 h-4" /> Purge Station Data
              </button>
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-col gap-1 text-center sm:text-left">
                <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2 justify-center sm:justify-start">
                  <RefreshCw className="w-5 h-5" /> Cache Control
                </h2>
                <p className="text-muted-foreground text-sm font-medium mt-1">
                  Force refresh the application&apos;s static pages and data cache.
                </p>
              </div>
              <button 
                onClick={handleClearCache}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-sm rounded-xl transition-all shadow-lg flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                <RefreshCw className="w-4 h-4" /> Clear Application Cache
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
