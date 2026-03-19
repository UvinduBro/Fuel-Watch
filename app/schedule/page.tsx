"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Car, Calendar, Info, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
export default function FuelSchedulePage() {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [hasCalculated, setHasCalculated] = useState(false);

  // Logic to determine odd/even
  const lastDigit = useMemo(() => {
    if (!vehicleNumber) return null;
    const digits = vehicleNumber.replace(/\D/g, "");
    if (digits.length === 0) return null;
    return parseInt(digits[digits.length - 1]);
  }, [vehicleNumber]);

  const isOddPart = lastDigit !== null ? lastDigit % 2 !== 0 : null;

  // Generate dates for current month
  const scheduleDates = useMemo(() => {
    if (lastDigit === null) return [];

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dates = [];
    const isOddPlate = lastDigit % 2 !== 0;

    for (let i = 1; i <= daysInMonth; i++) {
      const dateIsOdd = i % 2 !== 0;
      if (isOddPlate === dateIsOdd) {
        dates.push(new Date(year, month, i));
      }
    }
    return dates;
  }, [lastDigit]);

  const monthName = new Date().toLocaleString('default', { month: 'long' });

  return (
    <main className="min-h-screen pb-20 relative p-4 sm:p-8">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <header className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back to Map
            </Link>
            <Link href="/pass" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 text-sm font-bold transition-colors">
              Wallet Pass
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight">Fuel Quota Schedule</h1>
          <p className="text-muted-foreground mt-1 font-medium">Check your allowed pumping dates based on Sri Lanka&apos;s plate system.</p>
        </header>

        <section className="glass-panel p-6 sm:p-8 rounded-3xl border border-border shadow-2xl">
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" /> Vehicle Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. WP CAA-1234"
                  value={vehicleNumber}
                  onChange={(e) => {
                    setVehicleNumber(e.target.value.toUpperCase());
                    setHasCalculated(true);
                  }}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-4 text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all shadow-sm"
                />
                {lastDigit !== null && (
                  <div className={cn(
                    "absolute right-4 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-xs font-black border uppercase shadow-sm",
                    isOddPart ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                  )}>
                    {isOddPart ? "Odd Plate" : "Even Plate"}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border flex gap-4 text-sm text-muted-foreground font-medium leading-relaxed">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p>
                In Sri Lanka, fuel is distributed based on the last digit of your vehicle frame/number plate.
                <span className="text-foreground font-bold"> Odd (1, 3, 5, 7, 9)</span> numbers pump on odd dates,
                while <span className="text-foreground font-bold"> Even (0, 2, 4, 6, 8)</span> pump on even dates.
              </p>
            </div>
          </div>
        </section>

        {hasCalculated && lastDigit !== null && (
          <section className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 px-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Pumping allowed on these dates in {monthName}:</h2>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3">
              {scheduleDates.map((date, idx) => {
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div
                    key={idx}
                    className={cn(
                      "aspect-square rounded-2xl border flex flex-col items-center justify-center p-2 transition-all relative overflow-hidden",
                      isToday
                        ? "bg-primary border-primary shadow-[0_0_15px_-5px_rgba(59,130,246,0.5)] scale-105 z-10"
                        : "bg-muted/50 border-border hover:bg-muted"
                    )}
                  >
                    {isToday && <div className="absolute top-1 right-1"><CheckCircle2 className="w-3 h-3 text-white" /></div>}
                    <span className={cn("text-xs font-bold uppercase", isToday ? "text-white/80" : "text-muted-foreground")}>
                      {date.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className={cn("text-xl font-black", isToday ? "text-white" : "text-foreground")}>
                      {date.getDate()}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">Ready to pump?</h3>
                <p className="text-sm opacity-90 font-medium">Check the map to find the nearest station with fuel currently in stock!</p>
              </div>
            </div>
          </section>
        )}

        {hasCalculated && lastDigit === null && vehicleNumber.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3 font-bold text-sm">
            <AlertCircle className="w-5 h-5" />
            Please enter a valid vehicle number to detect your pumping quota.
          </div>
        )}
      </div>
    </main>
  );
}
