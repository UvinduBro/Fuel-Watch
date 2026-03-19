"use client";

import { useState } from "react";
import { Send, Bell, Loader2 } from "lucide-react";
import { db } from "@/lib/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export function NotificationPanel() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [stats, setStats] = useState<{ tokens: number } | null>(null);

  const fetchStats = async () => {
    const snapshot = await getDocs(collection(db, "fcm_tokens"));
    setStats({ tokens: snapshot.size });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    setSending(true);
    try {
      // In a real production app, this would call an API route that uses firebase-admin
      // to send messages to all tokens in the fcm_tokens collection.
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      
      if (res.ok) {
        alert("Notification broadcast initiated!");
        setTitle("");
        setBody("");
      } else {
        alert("Failed to send notification. Backend service required.");
      }
    } catch (err) {
      console.error(err);
      alert("Error triggering broadcast.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="glass-panel p-8 rounded-3xl border border-border flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Broadcast Notification</h3>
              <p className="text-xs text-muted-foreground">Send a push message to all active users</p>
            </div>
          </div>
          <button 
            onClick={fetchStats}
            className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
          >
            {stats ? `${stats.tokens} Registered Tokens` : "Show Stats"}
          </button>
        </div>

        <form onSubmit={handleSend} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Message Title</label>
            <input 
              required
              className="bg-muted border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50" 
              placeholder="E.g. 95 Octane Restock Alert!"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Message Body</label>
            <textarea 
              required
              rows={3}
              className="bg-muted border border-border rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" 
              placeholder="E.g. Multiple stations in Colombo 07 have just reported fresh stock."
              value={body}
              onChange={e => setBody(e.target.value)}
            />
          </div>
          <button 
            type="submit"
            disabled={sending}
            className="mt-2 flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-primary-foreground font-black rounded-xl hover:opacity-90 transition-all shadow-xl disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            {sending ? "Broadcasting..." : "Broadcast Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
