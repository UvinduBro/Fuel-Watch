"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Power, Link as LinkIcon, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface Ad {
  id: string;
  type: "banner" | "popup";
  imageUrl: string;
  link: string;
  active: boolean;
  position: "top" | "bottom";
}

export function AdManagement() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newAd, setNewAd] = useState<{ imageUrl: string; link: string; position: "top" | "bottom" }>({ imageUrl: "", link: "", position: "top" });

  const fetchAds = async () => {
    setLoading(true);
    const snapshot = await getDocs(collection(db, "ads"));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
    setAds(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAds();
  }, []);

  const handleToggle = async (ad: Ad) => {
    await updateDoc(doc(db, "ads", ad.id), { active: !ad.active });
    fetchAds();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this advertisement?")) {
      await deleteDoc(doc(db, "ads", id));
      fetchAds();
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "ads"), {
      ...newAd,
      active: true,
      type: "banner"
    });
    setShowAdd(false);
    setNewAd({ imageUrl: "", link: "", position: "top" });
    fetchAds();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-muted/50 p-4 rounded-2xl border border-border">
        <h2 className="text-xl font-bold px-2">Managed Advertisements</h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAdd} className="glass-panel p-8 rounded-3xl border border-border flex flex-col sm:flex-row gap-5 items-end">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Image URL</label>
            <input required className="bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={newAd.imageUrl} onChange={e => setNewAd({...newAd, imageUrl: e.target.value})} placeholder="https://..." />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Link URL</label>
            <input required className="bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" value={newAd.link} onChange={e => setNewAd({...newAd, link: e.target.value})} placeholder="https://..." />
          </div>
          <div className="w-32 flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Position</label>
            <select className="bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none h-[46px]" value={newAd.position} onChange={e => setNewAd({...newAd, position: e.target.value as "top" | "bottom"})}>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <button type="submit" className="px-6 py-3 bg-white text-black font-black text-sm rounded-xl">Create</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ads.map(ad => (
          <div key={ad.id} className="glass-panel p-5 rounded-3xl border border-border flex flex-col gap-4 group">
            <div className="relative aspect-[3/1] rounded-xl overflow-hidden border border-white/5 bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={ad.imageUrl} alt="Ad Preview" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[8px] font-black text-white uppercase tracking-wider backdrop-blur-md">
                Preview ({ad.position.toUpperCase()})
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground truncate max-w-[150px]">
                  <LinkIcon className="w-3 h-3" /> {ad.link}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleToggle(ad)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all",
                    ad.active ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                  )}
                >
                  <Power className="w-3 h-3" /> {ad.active ? "ACTIVE" : "PAUSED"}
                </button>
                <button 
                  onClick={() => handleDelete(ad.id)}
                  className="p-2.5 rounded-xl text-rose-500 opacity-50 group-hover:opacity-100 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
