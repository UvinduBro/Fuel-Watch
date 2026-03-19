"use client";

import { useState } from "react";
import { Bell, BellOff, MapPin, Fuel } from "lucide-react";
import { useNotifications } from "@/lib/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationSettings() {
  const { permission, requestPermission } = useNotifications();
  const [radius, setRadius] = useState(5);
  const [selectedFuels, setSelectedFuels] = useState<string[]>(["petrol92"]);

  return (
    <div className="glass-panel p-6 rounded-3xl border border-border flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Smart Alerts</h3>
            <p className="text-xs text-muted-foreground">Get notified when fuel is available near you</p>
          </div>
        </div>
        <button
          onClick={requestPermission}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-bold transition-all border",
            permission === "granted" 
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 cursor-default" 
              : "bg-primary text-primary-foreground border-primary hover:opacity-90"
          )}
        >
          {permission === "granted" ? "Enabled" : "Enable Alerts"}
        </button>
      </div>

      {permission === "granted" && (
        <div className="flex flex-col gap-5 animate-in slide-in-from-top-2 duration-500">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" /> Alert Radius: {radius}km
            </div>
            <input 
              type="range" 
              min="1" 
              max="20" 
              value={radius} 
              onChange={(e) => setRadius(parseInt(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground">
              <Fuel className="w-3.5 h-3.5" /> Fuel Types
            </div>
            <div className="flex flex-wrap gap-2">
              {["petrol92", "petrol95", "diesel", "superDiesel"].map((fuel) => (
                <button
                  key={fuel}
                  onClick={() => {
                    setSelectedFuels(prev => 
                      prev.includes(fuel) ? prev.filter(f => f !== fuel) : [...prev, fuel]
                    );
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all",
                    selectedFuels.includes(fuel)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted text-muted-foreground border-transparent hover:border-border"
                  )}
                >
                  {fuel.split(/(?=[A-Z])/).join(" ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {permission === "denied" && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-3">
          <BellOff className="w-4 h-4 shrink-0" />
          Notifications are blocked. Please enable them in your browser settings to receive alerts.
        </div>
      )}
    </div>
  );
}
