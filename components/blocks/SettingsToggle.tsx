"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon, Monitor, Globe, ChevronDown } from "lucide-react";
import { useTheme } from "@/lib/theme/provider";
import { useTranslation } from "@/lib/i18n/provider";
import { Locale } from "@/lib/i18n/dictionaries";
import { cn } from "@/lib/utils";

const langLabels: Record<Locale, { label: string; flag: string }> = {
  en: { label: "EN", flag: "🇬🇧" },
  si: { label: "සිං", flag: "🇱🇰" },
  ta: { label: "த", flag: "🇱🇰" },
};

export function SettingsToggle() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useTranslation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const themeOptions = [
    { value: "light" as const, icon: Sun, label: t("theme.light") },
    { value: "dark" as const, icon: Moon, label: t("theme.dark") },
    { value: "system" as const, icon: Monitor, label: t("theme.system") },
  ];

  return (
    <div className="flex items-center gap-2">
      {/* Theme Toggle */}
      <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border shadow-sm">
        {themeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              "p-2 rounded-full transition-all",
              theme === opt.value
                ? "bg-background text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={opt.label}
          >
            <opt.icon className="w-3.5 h-3.5" />
          </button>
        ))}
      </div>

      {/* Language Selector */}
      <div className="relative" ref={langRef}>
        <button
          onClick={() => setShowLangMenu(!showLangMenu)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-muted/50 border border-border text-xs font-bold transition-all hover:bg-muted shadow-sm"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{langLabels[locale].flag} {langLabels[locale].label}</span>
          <ChevronDown className={cn("w-3 h-3 transition-transform", showLangMenu && "rotate-180")} />
        </button>

        {showLangMenu && (
          <div className="absolute right-0 mt-2 w-40 bg-popover border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {(["en", "si", "ta"] as Locale[]).map((lang) => (
              <button
                key={lang}
                onClick={() => { setLocale(lang); setShowLangMenu(false); }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-colors",
                  locale === lang
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted"
                )}
              >
                <span className="text-lg">{langLabels[lang].flag}</span>
                <span>{t(`lang.${lang}`)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
