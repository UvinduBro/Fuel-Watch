import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";

export type FuelStatus = "available" | "low" | "out";

interface FuelStatusBadgeProps {
  status: FuelStatus;
  lastUpdated?: string;
}

export function FuelStatusBadge({ status, lastUpdated }: FuelStatusBadgeProps) {
  const statusConfig = {
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
      {lastUpdated && (
        <div className="text-[10px] text-muted-foreground flex items-center gap-1 ml-1">
          <Clock className="w-3 h-3" />
          {lastUpdated}
        </div>
      )}
    </div>
  );
}
