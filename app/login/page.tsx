"use client";

import { useAuth, signInWithGoogle } from "@/lib/firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2, ShieldCheck, ArrowLeft } from "lucide-react";

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/admin");
    }
  }, [user, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[20%] left-[30%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="glass-panel max-w-sm w-full p-8 flex flex-col items-center text-center gap-6 border border-white/10 shadow-2xl relative z-10">
        <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-foreground mb-2 shadow-inner">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Portal</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2 px-4">Sign in with an authorized Google account to manage stations.</p>
        </div>
        
        <button 
          onClick={signInWithGoogle}
          className="w-full py-3.5 mt-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-bold tracking-wide transition-all flex items-center justify-center gap-3 shadow-lg"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Sign in with Google
        </button>
        
        <button 
          onClick={() => router.push("/")}
          className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mt-2 flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Map
        </button>
      </div>
    </main>
  );
}
