"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { I18nProvider } from "@/lib/i18n/provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        {children}
        <Toaster />
      </I18nProvider>
    </SessionProvider>
  );
}
