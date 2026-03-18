import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { TimeAgo } from "./TimeAgo";

export type FuelStatus = "available" | "low" | "out" | "none";

interface FuelStatusBadgeProps {
  status: FuelStatus;
  lastUpdated?: string;
}

export function FuelStatusBadge({ status, lastUpdated }: FuelStatusBadgeProps) {
  const statusConfig = {
    none: {
      color: "bg-white/5 text-muted-foreground border-white/10",
      icon: Clock,
      label: "No Data Available",
    },
    available: {
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: CheckCircle2,
      label: "Available",
    },
    low: {
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: AlertTriangle,
      label: "Low Stock",
    },
    out: {
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: XCircle,
      label: "Out of Stock",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className="flex flex-col gap-1">
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
          config.color
        )}
      >
        <Icon className="w-3.5 h-3.5" />
        {config.label}
      </div>
      {lastUpdated && lastUpdated !== "No Data" && (
        <TimeAgo dateString={lastUpdated} />
      )}
    </div>
  );
}
