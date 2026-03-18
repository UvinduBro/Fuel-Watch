import Link from "next/link";
import { MapPin, Navigation, Info } from "lucide-react";
import { FuelStatusBadge, FuelStatus } from "./FuelStatusBadge";
import { cn } from "@/lib/utils";

export interface FuelMap {
  petrol92: { status: FuelStatus; lastUpdatedAt: string };
  petrol95: { status: FuelStatus; lastUpdatedAt: string };
  diesel: { status: FuelStatus; lastUpdatedAt: string };
  superDiesel: { status: FuelStatus; lastUpdatedAt: string };
}

export interface StationData {
  id: string;
  name: string;
  address: string;
  isOpen: boolean;
  distance: number;
  location: { lat: number; lng: number };
  fuels: FuelMap;
  updatedCount: number;
}

interface StationCardProps {
  station: StationData;
}

export function StationCard({ station }: StationCardProps) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-4 relative overflow-hidden transition-all hover:scale-[1.02] duration-300">
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-bold leading-tight">{station.name}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate max-w-[200px]" title={station.address}>{station.address}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className={cn(
            "text-xs px-2 py-0.5 rounded-full font-semibold",
            station.isOpen ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
          )}>
            {station.isOpen ? "OPEN" : "CLOSED"}
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {station.distance.toFixed(1)} km
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-2">
        <FuelStatusBadge status={station.fuels.petrol92.status} lastUpdated={station.fuels.petrol92.lastUpdatedAt} />
        <FuelStatusBadge status={station.fuels.petrol95.status} lastUpdated={station.fuels.petrol95.lastUpdatedAt} />
        <FuelStatusBadge status={station.fuels.diesel.status} lastUpdated={station.fuels.diesel.lastUpdatedAt} />
        <FuelStatusBadge status={station.fuels.superDiesel.status} lastUpdated={station.fuels.superDiesel.lastUpdatedAt} />
      </div>

      <div className="flex gap-2 mt-2 pt-4 border-t border-white/10 dark:border-white/5">
        <Link 
          href={`/station/${station.id}`}
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition-colors"
        >
          <Info className="w-4 h-4" />
          View Details
        </Link>
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium transition-colors"
          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(station.address)}`, "_blank")}
        >
          <Navigation className="w-4 h-4" />
          Directions
        </button>
      </div>
    </div>
  );
}
