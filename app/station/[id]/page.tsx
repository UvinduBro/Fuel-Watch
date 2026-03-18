"use client";

import { useState, useEffect } from "react";
import { getStationById, updateFuelStatus, updateQueueStatus } from "@/lib/firebase/db";
import { StationData, FuelMap } from "@/components/blocks/StationCard";
import { FuelStatusBadge, FuelStatus } from "@/components/blocks/FuelStatusBadge";
import { MapPin, ArrowLeft, Loader2, CheckCircle2, Clock, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";



export default function StationDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [station, setStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fuel Form State
  const [selectedFuel, setSelectedFuel] = useState<keyof FuelMap>("petrol92");
  const [selectedStatus, setSelectedStatus] = useState<FuelStatus>("available");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Queue Form State
  const [selectedQueue, setSelectedQueue] = useState<"none" | "medium" | "long">("none");
  const [isSubmittingQueue, setIsSubmittingQueue] = useState(false);
  const [queueSuccess, setQueueSuccess] = useState(false);

  useEffect(() => {
    const fetchStation = async () => {
      // 1. Get Firestore data if it exists
      const fsData = await getStationById(id);
      
      // 2. If we're on a browser and have Google Maps, try to get base data from Google
      if (typeof window !== "undefined" && window.google) {
        const service = new window.google.maps.places.PlacesService(document.createElement('div'));
        service.getDetails({ placeId: id }, (place, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
            setStation({
              id: id,
              name: place.name || fsData?.name || "Unknown Station",
              address: place.vicinity || place.formatted_address || fsData?.address || "Unknown Address",
              location: {
                lat: place.geometry?.location?.lat() || fsData?.location?.lat || 0,
                lng: place.geometry?.location?.lng() || fsData?.location?.lng || 0
              },
              isOpen: fsData?.isOpen ?? true,
              fuels: {
                petrol92: fsData?.fuels?.petrol92 || { status: "none", lastUpdatedAt: "No Data" },
                petrol95: fsData?.fuels?.petrol95 || { status: "none", lastUpdatedAt: "No Data" },
                diesel: fsData?.fuels?.diesel || { status: "none", lastUpdatedAt: "No Data" },
                superDiesel: fsData?.fuels?.superDiesel || { status: "none", lastUpdatedAt: "No Data" }
              },
              queue: fsData?.queue,
              queueUpdatedAt: fsData?.queueUpdatedAt,
              updatedCount: fsData?.updatedCount || 0,
              distance: 0
            } as StationData);
          } else {
            setStation({
              ...fsData,
              fuels: {
                petrol92: fsData?.fuels?.petrol92 || { status: "none", lastUpdatedAt: "No Data" },
                petrol95: fsData?.fuels?.petrol95 || { status: "none", lastUpdatedAt: "No Data" },
                diesel: fsData?.fuels?.diesel || { status: "none", lastUpdatedAt: "No Data" },
                superDiesel: fsData?.fuels?.superDiesel || { status: "none", lastUpdatedAt: "No Data" }
              }
            } as StationData);
          }
          setLoading(false);
        });
      } else {
        if (fsData) {
          setStation({
            ...fsData,
            fuels: {
              petrol92: fsData?.fuels?.petrol92 || { status: "none", lastUpdatedAt: "No Data" },
              petrol95: fsData?.fuels?.petrol95 || { status: "none", lastUpdatedAt: "No Data" },
              diesel: fsData?.fuels?.diesel || { status: "none", lastUpdatedAt: "No Data" },
              superDiesel: fsData?.fuels?.superDiesel || { status: "none", lastUpdatedAt: "No Data" }
            }
          } as StationData);
        } else {
          setStation(null);
        }
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) return;
    setIsSubmitting(true);
    try {
      await updateFuelStatus(station.id, selectedFuel, selectedStatus);
      setSuccess(true);
      setStation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          fuels: {
            ...prev.fuels,
            [selectedFuel]: { status: selectedStatus, lastUpdatedAt: new Date().toISOString() }
          }
        };
      });
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQueueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) return;
    setIsSubmittingQueue(true);
    try {
      await updateQueueStatus(station.id, selectedQueue);
      setQueueSuccess(true);
      setStation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          queue: selectedQueue,
          queueUpdatedAt: new Date().toISOString()
        };
      });
      setTimeout(() => setQueueSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to submit queue update.");
    } finally {
      setIsSubmittingQueue(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!station) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Station not found.</div>;
  }

  const fuelOptions: { key: keyof FuelMap; label: string }[] = [
    { key: "petrol92", label: "Petrol 92" },
    { key: "petrol95", label: "Petrol 95" },
    { key: "diesel", label: "Diesel" },
    { key: "superDiesel", label: "Super Diesel" },
  ];

  const hasUpdates = station.updatedCount > 0;
  
  function timeAgo(dateString: string) {
    if (dateString === "No Data" || !dateString) return "No Data";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " mins ago";
    return "just now";
  }

  const FuelRow = ({ label, fuel }: { label: string, fuel: { status: FuelStatus, lastUpdatedAt: string } }) => (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-center gap-3 font-bold text-sm text-foreground/90">
        <span className="text-xl leading-none">⛽</span> {label}
      </div>
      <FuelStatusBadge status={fuel.status} lastUpdated={timeAgo(fuel.lastUpdatedAt)} />
    </div>
  );

  return (
    <main className="min-h-screen pb-20 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        {/* Top Header Card */}
        <div className="glass-panel p-6 sm:p-8 flex flex-col gap-5 border border-white/10 shadow-xl rounded-3xl">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{station.name}</h1>
            <div className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-bold border shadow-sm ${station.isOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
              {station.isOpen ? "OPEN" : "CLOSED"}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-muted-foreground flex items-center gap-2 font-medium text-sm">
              <MapPin className="w-4 h-4 text-primary" />
              {station.address}
            </p>
            <p className="text-muted-foreground flex items-center gap-2 font-medium text-sm">
              <Clock className="w-4 h-4 text-primary" />
              {station.isOpen ? "Open now" : "Closed now"}
            </p>
          </div>
          <button
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(station.address)}`, "_blank")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 font-bold transition-colors mt-2 border border-white/10 shadow-sm text-foreground/90"
          >
            🗺 Get Directions
          </button>
        </div>

        {/* FUEL AVAILABILITY Section */}
        <div className="mt-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10">
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-6 flex justify-between items-center">
            Fuel Availability
            <span className="text-xs normal-case font-medium flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-400" /> {station.updatedCount}</span>
          </h2>

          {!hasUpdates && (
            <div className="px-4 py-3 mb-4 bg-[#eab308]/10 dark:bg-[#ca8a04]/10 border border-[#eab308]/20 rounded-xl text-[#ca8a04] dark:text-[#fde047] text-xs font-semibold">
              No fuel status updates in DB yet for this station.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {fuelOptions.map(opt => {
               const safeFuel = hasUpdates && station.fuels[opt.key] ? station.fuels[opt.key] : { status: "none", lastUpdatedAt: "No Data" };
               return <FuelRow key={opt.key} label={opt.label} fuel={safeFuel as any} />;
            })}
          </div>
        </div>

        {/* QUEUE STATUS Section */}
        <div className="mt-6 glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 pointer-events-none" />
          <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-6">Queue Status</h2>
          
          <div className="flex items-center gap-4 p-4 rounded-xl bg-black/20 border border-white/5">
             <div className="text-3xl">🚦</div>
             <div className="flex flex-col">
               <span className="font-bold text-foreground">Current Queue: <span className={cn("uppercase", station.queue === "none" ? "text-emerald-500" : station.queue === "medium" ? "text-amber-500" : station.queue === "long" ? "text-rose-500" : "text-muted-foreground")}>{station.queue || "Unknown"}</span></span>
               {station.queueUpdatedAt && <span className="text-xs text-muted-foreground mt-0.5">Last updated: {timeAgo(station.queueUpdatedAt)}</span>}
             </div>
          </div>
        </div>

        {/* UPDATE FORMS */}
        <div className="mt-8 grid grid-cols-1 gap-6">
          {/* Fuel Update */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
            <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-6">Update Fuel Availability</h2>
            {success ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-8 h-8" />
                <p className="font-semibold text-center">Thank you! Your fuel update aids the community.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold tracking-wide text-muted-foreground">Fuel Type</label>
                  <select 
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                    value={selectedFuel}
                    onChange={(e) => setSelectedFuel(e.target.value as keyof FuelMap)}
                  >
                    {fuelOptions.map(o => <option key={o.key} value={o.key} className="bg-neutral-900">{o.label}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold tracking-wide text-muted-foreground">Availability</label>
                  <div className="flex flex-col gap-3">
                    {(["available", "low", "out"] as FuelStatus[]).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedStatus(status)}
                        className={`flex items-center gap-3 py-4 border-b border-white/5 transition-all text-left group`}
                      >
                         <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedStatus === status ? "border-primary" : "border-muted-foreground/50 group-hover:border-white/50"}`}>
                            {selectedStatus === status && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                         </div>
                         <span className={`text-sm font-bold ${selectedStatus === status ? "text-foreground" : "text-muted-foreground group-hover:text-foreground/80"}`}>
                           {status === "available" ? "Available" : status === "low" ? "Low Stock" : "Out of Stock"}
                         </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-extrabold tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Update"}
                </button>
              </form>
            )}
          </div>

          {/* Queue Update */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
            <h2 className="text-sm font-bold tracking-widest text-muted-foreground uppercase mb-6">Update Queue Status</h2>
            {queueSuccess ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex flex-col items-center justify-center gap-3">
                <CheckCircle2 className="w-8 h-8" />
                <p className="font-semibold text-center">Thanks for keeping the queue updated!</p>
              </div>
            ) : (
              <form onSubmit={handleQueueSubmit} className="flex flex-col gap-6">
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold tracking-wide text-muted-foreground">Select Queue Condition</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedQueue("none")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${selectedQueue === "none" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-black/40 border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10"}`}
                    >
                      <span className="text-3xl">🏃</span>
                      <span className="text-xs font-bold text-center">No Queue</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedQueue("medium")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${selectedQueue === "medium" ? "bg-amber-500/20 border-amber-500/50 text-amber-500" : "bg-black/40 border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10"}`}
                    >
                      <span className="text-3xl">🚶‍♂️🚶</span>
                      <span className="text-xs font-bold text-center">Medium</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedQueue("long")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${selectedQueue === "long" ? "bg-rose-500/20 border-rose-500/50 text-rose-500" : "bg-black/40 border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10"}`}
                    >
                      <span className="text-3xl">🚗🚓🚕</span>
                      <span className="text-xs font-bold text-center">Long Queue</span>
                    </button>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmittingQueue}
                  className="w-full py-4 mt-2 rounded-xl bg-white text-black hover:bg-neutral-200 font-extrabold tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xl"
                >
                  {isSubmittingQueue ? <Loader2 className="w-5 h-5 animate-spin" /> : "Update Queue"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
