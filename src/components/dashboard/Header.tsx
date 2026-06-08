"use client";

import { useSession } from "next-auth/react";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { LanguageSwitcher } from "@/components/ui/language/LanguageSwitcher";

export function Header() {
  const { data: session } = useSession();
  const { t } = useI18n();

  return (
    <header className="flex items-center justify-between h-14 px-6 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder={t.dashboard.header.searchPlaceholder}
            className="h-9 w-64 rounded-lg bg-surface-raised border border-border pl-9 pr-4 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-border-hover transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center">
          <LanguageSwitcher />
        </div>

        <button
          className="relative p-2 rounded-lg hover:bg-surface-raised text-text-secondary transition-colors"
          aria-label={t.dashboard.header.notifications}
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
        </button>

        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-surface-raised transition-colors"
          data-tour="header-profile"
        >
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-accent-purple flex items-center justify-center text-xs font-bold text-white">
            {session?.user?.name?.charAt(0) || "U"}
          </div>
          <span className="text-sm font-medium hidden sm:block">
            {session?.user?.name || t.dashboard.header.userFallback}
          </span>
        </Link>
      </div>
    </header>
  );
}
