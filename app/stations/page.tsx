"use client";

import { useState, useEffect } from "react";
import { useStations } from "@/lib/hooks/useStations";
import { StationCard } from "@/components/blocks/StationCard";
import { Loader2, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";

export default function AllStationsPage() {
  const [search, setSearch] = useState("Sri Lanka");
  const [debouncedSearch, setDebouncedSearch] = useState("Sri Lanka");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 600);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch dynamically based on the debounced search term
  const { stations, isLoading } = useStations(undefined, undefined, debouncedSearch);

  return (
    <main className="min-h-screen pb-20 p-4 sm:p-8 relative">
       {/* Background */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

       <div className="max-w-5xl mx-auto flex flex-col gap-8 mt-8">
        <header className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-4 mb-4">
               <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
                 <ArrowLeft className="w-4 h-4" /> Back to Map
               </Link>
               <Link href="/pass" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-bold transition-colors">
                 📱 Wallet Pass
               </Link>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">All Island Fuel Stations</h1>
            <p className="font-medium text-muted-foreground mt-1">Browse and search through stations across Sri Lanka</p>
          </div>
          
          <div className="relative w-full sm:w-auto mt-4 sm:mt-0 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text"
              placeholder="Search by city or district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground font-medium">Searching Google Places...</p>
          </div>
        ) : stations.length === 0 ? (
          <div className="glass-panel p-12 text-center flex flex-col items-center border-dashed border-white/20 rounded-2xl">
            <p className="text-muted-foreground font-medium text-lg">No stations found matching &quot;{debouncedSearch}&quot;.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stations.map(station => (
               <StationCard key={station.id} station={{...station, distance: 0}} />
            ))}
          </div>
        )}
       </div>
    </main>
  );
}
