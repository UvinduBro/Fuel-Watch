"use client";

import { useState, useEffect } from "react";
import { getStationById, updateFuelStatus } from "@/lib/firebase/db";
import { StationData, FuelMap } from "@/components/blocks/StationCard";
import { FuelStatusBadge, FuelStatus } from "@/components/blocks/FuelStatusBadge";
import { MapPin, Navigation, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StationDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const [station, setStation] = useState<StationData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedFuel, setSelectedFuel] = useState<keyof FuelMap>("petrol92");
  const [selectedStatus, setSelectedStatus] = useState<FuelStatus>("available");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getStationById(id).then(data => {
      setStation(data);
      setLoading(false);
    });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!station) return;
    setIsSubmitting(true);
    try {
      await updateFuelStatus(station.id, selectedFuel, selectedStatus);
      setSuccess(true);
      // Update local state temporarily
      setStation(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          fuels: {
            ...prev.fuels,
            [selectedFuel]: { status: selectedStatus, lastUpdatedAt: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) }
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

  return (
    <main className="min-h-screen pb-20 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 pt-8">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </button>

        <div className="glass-panel p-6 sm:p-8 flex flex-col gap-6">
          <div>
            <div className="flex justify-between items-start mb-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{station.name}</h1>
              <div className={`text-xs px-3 py-1 rounded-full font-bold border ${station.isOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                {station.isOpen ? "OPEN" : "CLOSED"}
              </div>
            </div>
            <p className="text-muted-foreground flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4" />
              {station.address}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {fuelOptions.map(opt => (
              <div key={opt.key} className="p-4 rounded-xl bg-black/20 border border-white/5 flex flex-col gap-3">
                <span className="font-semibold text-sm tracking-wide text-foreground/80">{opt.label}</span>
                <FuelStatusBadge status={station.fuels[opt.key].status} lastUpdated={station.fuels[opt.key].lastUpdatedAt} />
              </div>
            ))}
          </div>

          <button
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(station.address)}`, "_blank")}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 font-semibold transition-colors mt-2 border border-white/10"
          >
            <Navigation className="w-4 h-4" /> Get Directions
          </button>
        </div>

        {/* Update Form */}
        <div className="mt-8 glass-card p-6 sm:p-8 rounded-3xl border border-white/10">
          <h2 className="text-xl font-bold mb-6">Contribute an Update</h2>
          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex flex-col items-center justify-center gap-3">
              <CheckCircle2 className="w-8 h-8" />
              <p className="font-semibold text-center">Thank you! Your update aids the community.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Fuel Type</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/20 appearance-none"
                  value={selectedFuel}
                  onChange={(e) => setSelectedFuel(e.target.value as keyof FuelMap)}
                >
                  {fuelOptions.map(o => <option key={o.key} value={o.key} className="bg-neutral-900">{o.label}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-semibold tracking-wide text-muted-foreground uppercase">Availability Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["available", "low", "out"] as FuelStatus[]).map(status => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setSelectedStatus(status)}
                      className={`py-3.5 rounded-xl text-xs sm:text-sm font-bold border transition-all ${
                        selectedStatus === status 
                          ? status === "available" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" 
                            : status === "low" ? "bg-amber-500/20 border-amber-500/50 text-amber-500"
                            : "bg-rose-500/20 border-rose-500/50 text-rose-500"
                          : "bg-black/40 border-white/5 text-muted-foreground hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-4 mt-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold tracking-wide transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Update"}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
