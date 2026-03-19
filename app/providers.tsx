"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "@/lib/theme/provider";
import { I18nProvider } from "@/lib/i18n/provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
      </I18nProvider>
    </ThemeProvider>
  );
}
