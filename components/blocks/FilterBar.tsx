import { MapPin, Filter } from "lucide-react";

interface FilterBarProps {
  locationName: string;
  customLocation: string;
  tempLocation: string;
  setTempLocation: (val: string) => void;
  isEditingLocation: boolean;
  setIsEditingLocation: (val: boolean) => void;
  setCustomLocation: (val: string) => void;
  showOpenOnly: boolean;
  setShowOpenOnly: (val: boolean) => void;
}

export function FilterBar({ 
  locationName, customLocation, tempLocation, setTempLocation,
  isEditingLocation, setIsEditingLocation, setCustomLocation,
  showOpenOnly, setShowOpenOnly 
}: FilterBarProps) {
  return (
    <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 justify-between items-center z-10 sticky top-4 shadow-2xl">
      <div className="relative w-full sm:w-96">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
        {!isEditingLocation ? (
          <button 
            className="w-full text-left bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm font-semibold transition-all hover:bg-white/10 hover:border-white/20 text-foreground"
            onClick={() => { setIsEditingLocation(true); setTempLocation(customLocation); }}
          >
            {customLocation ? `Searching: ${customLocation}` : `Your Location • ${locationName}`}
          </button>
        ) : (
          <input 
            autoFocus
            type="text" 
            placeholder="Type city (e.g., Kandy) and press Enter..." 
            className="w-full bg-black/60 border border-primary/50 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary transition-all font-bold placeholder:text-muted-foreground/70"
            value={tempLocation}
            onChange={(e) => setTempLocation(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setCustomLocation(tempLocation);
                setIsEditingLocation(false);
              } else if (e.key === 'Escape') {
                setIsEditingLocation(false);
              }
            }}
            onBlur={() => {
              setCustomLocation(tempLocation);
              setIsEditingLocation(false);
            }}
          />
        )}
      </div>
      <div className="flex gap-2 w-full sm:w-auto">
        <button 
          onClick={() => setShowOpenOnly(!showOpenOnly)}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors border ${
            showOpenOnly 
              ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-500' 
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
        >
          <Filter className="w-4 h-4" />
          {showOpenOnly ? "Open Only" : "All Stations"}
        </button>
      </div>
    </div>
  );
}
