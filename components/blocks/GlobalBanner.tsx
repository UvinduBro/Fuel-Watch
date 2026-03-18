"use client";

import { Info, X } from "lucide-react";
import { useState, useEffect } from "react";

export function GlobalBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const dismissed = localStorage.getItem("fuel-watch-banner-dismissed");
    if (dismissed === "true") {
      setIsVisible(false);
    }
  }, []);

  if (!mounted || !isVisible) return null;

  return (
    <div className="bg-[#eab308]/10 border-b border-[#eab308]/20 px-4 py-3 relative z-50">
      <div className="max-w-[1400px] mx-auto flex items-start gap-3 text-[#ca8a04] dark:text-[#fde047] text-xs sm:text-sm font-semibold pr-8">
        <Info className="w-5 h-5 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1 leading-relaxed">
          <span className="font-bold opacity-90">ඉන්ධන තත්ත්වය ජනතාව විසින් වාර්තා කරනු ලබන අතර මෑත කාලීන තත්ත්වය වෙනස් විය හැකිය.</span>
          <span className="opacity-80">Fuel status is updated by the public and reflects recent user reports, though availability can change.</span>
        </div>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          localStorage.setItem("fuel-watch-banner-dismissed", "true");
        }}
        className="absolute top-1/2 -translate-y-1/2 right-4 text-[#ca8a04]/70 dark:text-[#fde047]/70 hover:text-[#ca8a04] dark:hover:text-[#fde047] transition-colors p-1"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}
