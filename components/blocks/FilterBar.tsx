import { Search, Filter } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  showOpenOnly: boolean;
  setShowOpenOnly: (val: boolean) => void;
}

export function FilterBar({ searchQuery, setSearchQuery, showOpenOnly, setShowOpenOnly }: FilterBarProps) {
  return (
    <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 justify-between items-center z-10 sticky top-4">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input 
          type="text" 
          placeholder="Search by area or station..." 
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
