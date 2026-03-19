"use client";

import Link from "next/link";
import { MapPin, Navigation, Info, Clock, Users } from "lucide-react";
import { FuelStatusBadge, FuelStatus } from "./FuelStatusBadge";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/provider";

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
  isNearest?: boolean;
}

interface StationCardProps {
  station: StationData;
}

const FuelRow = ({ label, fuel }: { label: string, fuel: { status: FuelStatus, lastUpdatedAt: string } }) => (
  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-muted/50 border border-border hover:bg-muted transition-colors">
    <div className="flex items-center gap-3 font-bold text-sm text-foreground/90">
      <span className="text-xl leading-none">⛽</span> {label}
    </div>
    <FuelStatusBadge status={fuel.status} lastUpdated={fuel.lastUpdatedAt} />
  </div>
);

export function StationCard({ station }: StationCardProps) {
  const { t } = useTranslation();

  return (
    <div className={cn(
      "glass-card rounded-2xl p-4 sm:p-5 flex flex-col gap-5 relative overflow-hidden transition-all hover:scale-[1.01] duration-300 border shadow-xl",
      station.isNearest 
        ? "border-primary/50 shadow-[0_0_20px_-5px_rgba(59,130,246,0.3)] ring-1 ring-primary/20" 
        : "border-border"
    )}>
      {/* Top Banner Row */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {station.distance > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-black tracking-wider flex items-center gap-1.5 shadow-sm">
              <MapPin className="w-3 h-3" /> {t("station.nearest")}
            </span>
          )}
          {station.distance > 0 && (
            <span className="bg-muted/50 text-foreground text-xs px-2.5 py-1 rounded-full font-bold border border-border shadow-sm backdrop-blur-md">
              {station.distance.toFixed(1)} {t("station.kmAway")}
            </span>
          )}
          {station.distance === 0 && (
             <span className="bg-muted/50 text-foreground text-xs px-2.5 py-1 rounded-full font-bold border border-border shadow-sm backdrop-blur-md">
             {t("station.islandWide")}
             </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold border shadow-sm backdrop-blur-md",
            station.isOpen ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
          )}>
            <Clock className="w-3 h-3" /> {station.isOpen ? t("station.openNow") : t("station.closed")}
          </div>
          {station.queue && (
             <div className="flex flex-col gap-1 items-end">
               <div className={cn(
                 "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-extrabold border shadow-sm backdrop-blur-md",
                 station.queue === "none" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                 station.queue === "medium" ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                 "bg-rose-500/10 text-rose-500 border-rose-500/20"
               )}>
                 🚦 {station.queue.toUpperCase()}
               </div>
               <div className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground opacity-70">
                 {station.queue === "none" ? "Wait: ~5m" : station.queue === "medium" ? "Wait: ~30m" : "Wait: 1h+"}
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Queue Visual Bar */}
      {station.queue && (
        <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-muted/30 -mt-2">
          <div className={cn("h-full flex-1 transition-all duration-1000", (station.queue === "none" || station.queue === "medium" || station.queue === "long") ? "bg-emerald-500" : "bg-transparent")} />
          <div className={cn("h-full flex-1 transition-all duration-1000", (station.queue === "medium" || station.queue === "long") ? "bg-amber-500" : "bg-transparent")} />
          <div className={cn("h-full flex-1 transition-all duration-1000", (station.queue === "long") ? "bg-rose-500" : "bg-transparent")} />
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1 mt-1">
        <h3 className="text-xl font-extrabold leading-tight tracking-tight">{station.name || "Unknown Station"}</h3>
        <p className="text-sm text-muted-foreground truncate font-medium" title={station.address}>{station.address || "Location not available"}</p>
      </div>

      {/* Fuel Rows */}
      <div className="flex flex-col gap-2.5 mt-2">
        <FuelRow label={t("fuel.petrol92")} fuel={station.updatedCount > 0 ? station.fuels.petrol92 : { status: "none", lastUpdatedAt: t("station.noData") }} />
        <FuelRow label={t("fuel.petrol95")} fuel={station.updatedCount > 0 ? station.fuels.petrol95 : { status: "none", lastUpdatedAt: t("station.noData") }} />
        <FuelRow label={t("fuel.diesel")} fuel={station.updatedCount > 0 ? station.fuels.diesel : { status: "none", lastUpdatedAt: t("station.noData") }} />
        <FuelRow label={t("fuel.superDiesel")} fuel={station.updatedCount > 0 ? station.fuels.superDiesel : { status: "none", lastUpdatedAt: t("station.noData") }} />
      </div>

      {/* Footer Details */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-2 pt-4 border-t border-border gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="text-[10px] sm:text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 sm:w-4 sm:w-4 text-blue-400" /> {station.updatedCount || 0} {t("station.peopleUpdated")}
          </div>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Link 
            href={`/station/${station.id}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 hover:bg-secondary text-sm font-bold transition-colors border border-border"
          >
            <Info className="w-4 h-4" />
            {t("station.details")}
          </Link>
          <button
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold transition-colors shadow-lg"
            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(station.address)}`, "_blank")}
          >
            <Navigation className="w-4 h-4" />
            {t("station.navigate")}
          </button>
        </div>
      </div>
    </div>
  );
}
