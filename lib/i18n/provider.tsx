"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Locale, dictionaries } from "./dictionaries";

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("fuel-watch-locale") as Locale | null;
    if (saved && dictionaries[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("fuel-watch-locale", newLocale);
    // Update HTML lang attribute
    document.documentElement.lang = newLocale === "si" ? "si" : newLocale === "ta" ? "ta" : "en";
  };

  const t = (key: string): string => {
    if (!mounted) return dictionaries.en[key] || key;
    return dictionaries[locale]?.[key] || dictionaries.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useTranslation = () => useContext(I18nContext);
