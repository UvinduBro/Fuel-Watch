"use client";

import { ArrowLeft, Smartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

export default function PassPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <main className="min-h-screen pb-20 p-4 sm:p-8 relative flex flex-col">
       {/* Background */}
       <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[150px]" />
      </div>

       <div className="max-w-4xl mx-auto flex flex-col gap-6 w-full flex-1">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mt-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Map
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
               <Smartphone className="w-8 h-8 text-primary" />
               Fuel Pass to Wallet
            </h1>
            <p className="font-medium text-muted-foreground mt-1">Easily convert your Fuel QR code into an Apple or Google Wallet pass via Hayaku.</p>
          </div>
        </header>

        <section className="glass-panel p-2 rounded-3xl border border-white/10 flex-1 relative min-h-[600px] overflow-hidden shadow-2xl">
           {isLoading && (
               <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm z-10 gap-4">
                   <Loader2 className="w-8 h-8 animate-spin text-primary" />
                   <p className="font-bold text-sm text-white/80">Connecting to Hayaku.lk...</p>
               </div>
           )}
           <iframe 
               src="https://hayaku.lk/" 
               className="w-full h-full rounded-2xl border-none bg-black"
               title="Hayaku Fuel Pass Generator"
               onLoad={() => setIsLoading(false)}
               sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
           />
        </section>
       </div>
    </main>
  );
}
