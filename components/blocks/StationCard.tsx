import Link from "next/link";
import { MapPin, Navigation, Info, Clock, Users } from "lucide-react";
import { FuelStatusBadge, FuelStatus } from "./FuelStatusBadge";
import { cn } from "@/lib/utils";

export interface FuelMap {
  petrol92: { status: FuelStatus; lastUpdatedAt: string };
  petrol95: { status: FuelStatus; lastUpdatedAt: string };
  diesel: { status: FuelStatus; lastUpdatedAt: string };
  superDiesel: { status: FuelStatus; lastUpdatedAt: string };
}

export type QueueStatus = "none" | "medium" | "long";

export interface StationData {
  id: string;
  name: string;
  address: string;
  isOpen: boolean;
  distance: number;
  location: { lat: number; lng: number };
  fuels: FuelMap;
  queue?: QueueStatus;
  queueUpdatedAt?: string;
  updatedCount: number;
}

interface StationCardProps {
  station: StationData;
}

const FuelRow = ({ label, fuel }: { label: string, fuel: { status: FuelStatus, lastUpdatedAt: string } }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-3 font-bold text-sm text-foreground/90">
      <span className="text-xl leading-none">⛽</span> {label}
    </div>
    <FuelStatusBadge status={fuel.status} />
  </div>
);

export function StationCard({ station }: StationCardProps) {
  // We can consider the station "un-updated" if all fuels say "Just now" or if there is a specific field. We'll use updatedCount.
  const hasUpdates = station.updatedCount > 0;

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-5 relative overflow-hidden transition-all hover:scale-[1.01] duration-300 border border-white/10 shadow-xl">
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {station.distance > 0 && (
            <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black tracking-wider flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3 h-3" /> NEAREST
            </span>
          )}
          {station.distance > 0 && (
            <span className="bg-white/10 text-foreground text-xs px-2.5 py-1 rounded-full font-bold border border-white/10 shadow-sm backdrop-blur-md">
              {station.distance.toFixed(1)} km away
            </span>
          )}
          {station.distance === 0 && (
             <span className="bg-white/10 text-foreground text-xs px-2.5 py-1 rounded-full font-bold border border-white/10 shadow-sm backdrop-blur-md">
             Island-Wide
             </span>
          )}
        </div>
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold border shadow-sm backdrop-blur-md",
          station.isOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
        )}>
          <Clock className="w-3 h-3" /> {station.isOpen ? "Open now" : "Closed"}
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-1 mt-1">
        <h3 className="text-xl font-extrabold leading-tight tracking-tight">{station.name}</h3>
        <p className="text-sm text-muted-foreground truncate font-medium" title={station.address}>{station.address}</p>
      </div>

      {/* Fuel Rows */}
      <div className="flex flex-col gap-2.5 mt-2">
        <FuelRow label="Petrol 92" fuel={station.fuels.petrol92} />
        <FuelRow label="Petrol 95" fuel={station.fuels.petrol95} />
        <FuelRow label="Diesel" fuel={station.fuels.diesel} />
        <FuelRow label="Super Diesel" fuel={station.fuels.superDiesel} />
      </div>

      {/* Warning / Status Box */}
      {!hasUpdates && (
        <div className="px-4 py-3 bg-[#eab308]/10 dark:bg-[#ca8a04]/10 border border-[#eab308]/20 rounded-xl text-[#ca8a04] dark:text-[#fde047] text-xs font-semibold mt-1">
          No fuel status updates in DB yet for this station.
        </div>
      )}

      {/* Footer Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 pt-4 border-t border-white/10 dark:border-white/5 gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400" /> {station.updatedCount || 0} people updated this shed
          </div>
          {station.queue && (
            <div className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
               🚦 Queue: <span className={cn("px-2 py-0.5 rounded-md", station.queue === "none" ? "bg-emerald-500/20 text-emerald-500" : station.queue === "medium" ? "bg-amber-500/20 text-amber-500" : "bg-rose-500/20 text-rose-500")}>{station.queue.toUpperCase()}</span>
            </div>
          )}
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Link 
            href={`/station/${station.id}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-bold transition-colors border border-white/10"
          >
            <Info className="w-4 h-4" />
            Details
          </Link>
          <button
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold transition-colors shadow-lg"
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(station.address)}`, "_blank")}
          >
            <Navigation className="w-4 h-4" />
            Navigate
          </button>
        </div>
      </div>
    </div>
  );
}
