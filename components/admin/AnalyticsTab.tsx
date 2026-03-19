"use client";

import { useState, useEffect } from "react";
import { Loader2, Users, Eye, Clock, Monitor, Smartphone, Tablet, Globe, BarChart3, TrendingUp, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface GAData {
  configured: boolean;
  message?: string;
  summary: { totalUsers: number; totalPageviews: number; totalSessions: number; avgSessionDuration: number };
  topPages: { page: string; views: number; users: number }[];
  dailyUsers: { date: string; users: number; pageviews: number }[];
  deviceBreakdown: { device: string; users: number }[];
  countryBreakdown: { country: string; users: number }[];
}

const DeviceIcon = ({ device }: { device: string }) => {
  switch (device.toLowerCase()) {
    case "desktop": return <Monitor className="w-4 h-4" />;
    case "mobile": return <Smartphone className="w-4 h-4" />;
    case "tablet": return <Tablet className="w-4 h-4" />;
    default: return <Globe className="w-4 h-4" />;
  }
};

export function AnalyticsTab() {
  const [data, setData] = useState<GAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics")
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  if (error || (data && !(data as any).configured && (data as any).error)) return (
    <div className="glass-panel p-8 rounded-3xl text-center border border-rose-500/30 bg-rose-500/5">
      <p className="text-rose-400 font-bold mb-2">Failed to load analytics</p>
      <p className="text-rose-400/80 text-xs font-mono break-all">{error || (data as any)?.error}</p>
    </div>
  );

  if (!data || !data.configured) return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="glass-panel p-8 rounded-3xl border border-amber-500/30 bg-amber-500/5 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-amber-500 flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Google Analytics Not Configured</h2>
        <p className="text-muted-foreground text-sm font-medium leading-relaxed">{data?.message}</p>
        <div className="mt-4 p-4 rounded-xl bg-muted border border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Setup Instructions</p>
          <ol className="text-sm text-foreground/80 font-medium space-y-2 list-decimal list-inside">
            <li>Go to <a href="https://analytics.google.com" target="_blank" className="text-primary underline">Google Analytics</a> → Admin → Property Settings → Copy the <strong>Property ID</strong> (numeric).</li>
            <li>Go to <a href="https://console.cloud.google.com/iam-admin/serviceaccounts" target="_blank" className="text-primary underline">Google Cloud Console</a> → Create a Service Account → Create a JSON key.</li>
            <li>In GA Admin → Property Access Management → Add the service account email with <strong>Viewer</strong> role.</li>
            <li>Add these to your <code className="bg-muted px-1.5 py-0.5 rounded text-xs border border-border">.env.local</code>:
              <pre className="mt-2 p-3 bg-muted/80 rounded-lg text-xs font-mono overflow-x-auto border border-border shadow-inner">
{`GA_PROPERTY_ID="123456789"
GOOGLE_APPLICATION_CREDENTIALS_JSON='{"type":"service_account",...}'`}
              </pre>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );

  const { summary, topPages, dailyUsers, deviceBreakdown, countryBreakdown } = data;
  const maxDailyViews = Math.max(...dailyUsers.map(d => d.pageviews), 1);
  const totalDeviceUsers = deviceBreakdown.reduce((s, d) => s + d.users, 0) || 1;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: summary.totalUsers.toLocaleString(), icon: Users, color: "text-blue-500", sub: "Last 30 days" },
          { label: "Page Views", value: summary.totalPageviews.toLocaleString(), icon: Eye, color: "text-emerald-500", sub: "Last 30 days" },
          { label: "Sessions", value: summary.totalSessions.toLocaleString(), icon: TrendingUp, color: "text-purple-500", sub: "Last 30 days" },
          { label: "Avg Duration", value: `${Math.round(summary.avgSessionDuration)}s`, icon: Clock, color: "text-amber-500", sub: "Per session" },
        ].map((stat, i) => (
          <div key={i} className="glass-panel p-6 rounded-3xl border border-border flex flex-col gap-1 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <stat.icon className={cn("w-5 h-5", stat.color)} />
              <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.sub}</span>
            </div>
            <div className="text-3xl font-black mt-2">{stat.value}</div>
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Traffic Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-border">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Daily Traffic (14 days)</h3>
          </div>
          <div className="flex items-end justify-between gap-1.5 h-40">
            {dailyUsers.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  style={{ height: `${(day.pageviews / maxDailyViews) * 100}%` }}
                  className="w-full bg-primary/30 group-hover:bg-primary/70 rounded-t-lg transition-all duration-500 relative cursor-help border-t border-x border-border min-h-[2px]"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl z-10">
                    {day.pageviews} views • {day.users} users
                  </div>
                </div>
                <span className="text-[8px] font-bold text-muted-foreground">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="glass-panel p-6 rounded-3xl border border-border flex flex-col gap-4 shadow-sm">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Devices</h3>
          <div className="flex flex-col gap-3 flex-1 justify-center">
            {deviceBreakdown.map((device, i) => {
              const pct = Math.round((device.users / totalDeviceUsers) * 100);
              return (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold flex items-center gap-2 capitalize">
                      <DeviceIcon device={device.device} /> {device.device}
                    </span>
                    <span className="text-xs font-mono font-bold text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-primary/60 rounded-full transition-all duration-1000" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages  */}
        <div className="glass-panel p-6 rounded-3xl border border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Top Pages</h3>
          <div className="flex flex-col divide-y divide-border/50">
            {topPages.map((page, i) => (
              <div key={i} className="flex items-center justify-between py-3 group">
                <span className="text-sm font-bold text-foreground/80 truncate max-w-[250px] group-hover:text-foreground transition-colors">{page.page}</span>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs font-mono text-muted-foreground">{page.views} views</span>
                  <span className="text-xs font-mono text-muted-foreground">{page.users} users</span>
                </div>
              </div>
            ))}
            {topPages.length === 0 && <p className="text-sm text-muted-foreground italic py-4 text-center">No page data yet.</p>}
          </div>
        </div>

        {/* Countries */}
        <div className="glass-panel p-6 rounded-3xl border border-border">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Top Countries</h3>
          <div className="flex flex-col divide-y divide-border/50">
            {countryBreakdown.map((country, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <span className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-primary" /> {country.country}
                </span>
                <span className="text-xs font-mono font-bold text-muted-foreground">{country.users} users</span>
              </div>
            ))}
            {countryBreakdown.length === 0 && <p className="text-sm text-muted-foreground italic py-4 text-center">No country data yet.</p>}
          </div>
        </div>
      </div>

      {/* Quick Link */}
      <a
        href={`https://analytics.google.com`}
        target="_blank"
        rel="noopener noreferrer"
        className="glass-panel p-5 rounded-2xl border border-border hover:bg-muted transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
      >
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold">Open Full Google Analytics Dashboard</span>
        </div>
        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </a>
    </div>
  );
}
