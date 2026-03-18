"use client";

import { cn } from "@/lib/utils";

interface DistributionData {
  available: number;
  low: number;
  out: number;
  none: number;
}

interface StatusChartProps {
  label: string;
  data: DistributionData;
}

export function StatusChart({ label, data }: StatusChartProps) {
  const total = data.available + data.low + data.out + data.none;
  const getWidth = (val: number) => total > 0 ? `${(val / total) * 100}%` : "0%";

  return (
    <div className="flex flex-col gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-sm">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-[10px] font-mono text-muted-foreground bg-white/5 px-2 py-0.5 rounded-md">
          {total} stations
        </span>
      </div>
      
      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden flex shadow-inner">
        <div style={{ width: getWidth(data.available) }} className="bg-emerald-500 h-full transition-all duration-1000" title={`Available: ${data.available}`} />
        <div style={{ width: getWidth(data.low) }} className="bg-amber-500 h-full transition-all duration-1000" title={`Low Stock: ${data.low}`} />
        <div style={{ width: getWidth(data.out) }} className="bg-rose-500 h-full transition-all duration-1000" title={`Out: ${data.out}`} />
        <div style={{ width: getWidth(data.none) }} className="bg-white/10 h-full transition-all duration-1000" title={`No Data: ${data.none}`} />
      </div>

      <div className="grid grid-cols-4 gap-1 mt-1">
        {[
          { label: "AVL", color: "bg-emerald-500", val: data.available },
          { label: "LOW", color: "bg-amber-500", val: data.low },
          { label: "OUT", color: "bg-rose-500", val: data.out },
          { label: "N/A", color: "bg-white/20", val: data.none },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center">
            <div className={cn("w-1.5 h-1.5 rounded-full mb-1", item.color)} />
            <span className="text-[9px] font-bold text-muted-foreground">{item.label}</span>
            <span className="text-[10px] font-mono font-bold">{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface MiniBarChartProps {
    data: number[];
    labels: string[];
}

export function MiniBarChart({ data, labels }: MiniBarChartProps) {
    const max = Math.max(...data, 1);
    
    return (
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 shadow-sm h-full">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1">Weekly Activity</h3>
            <div className="flex items-end justify-between gap-2 h-32 px-1">
                {data.map((val, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div 
                            style={{ height: `${(val / max) * 100}%` }} 
                            className="w-full bg-primary/40 group-hover:bg-primary/80 rounded-t-lg transition-all duration-500 relative cursor-help border-t border-x border-white/10"
                        >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                {val}
                            </div>
                        </div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase">{labels[i]}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
