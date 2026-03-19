"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase/config";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";

interface Ad {
  id: string;
  type: "banner" | "popup";
  imageUrl: string;
  link: string;
  active: boolean;
  position: "top" | "bottom";
}

export function AdBanner({ position }: { position: "top" | "bottom" }) {
  const [ad, setAd] = useState<Ad | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      const q = query(
        collection(db, "ads"),
        where("active", "==", true),
        where("type", "==", "banner"),
        where("position", "==", position),
        limit(1)
      );
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        setAd({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Ad);
      }
    };
    fetchAd();
  }, [position]);

  if (!ad) return null;

  return (
    <div className={cn(
      "w-full px-4 sm:px-8 transition-all animate-in fade-in duration-1000",
      position === "top" ? "pt-4" : "pb-4"
    )}>
      <a 
        href={ad.link} 
        target="_blank" 
        className="block relative group overflow-hidden rounded-2xl border border-white/5 shadow-2xl"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={ad.imageUrl} alt="Advertisement" className="w-full h-auto object-cover max-h-[100px] sm:max-h-[140px] group-hover:scale-[1.02] transition-transform duration-700" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
        <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/40 text-[8px] font-black text-white/60 uppercase tracking-widest backdrop-blur-md">AD</span>
      </a>
    </div>
  );
}
