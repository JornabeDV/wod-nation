"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function CompetitionTabs({
  tabs,
}: {
  tabs: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 overflow-x-auto border-b pb-px">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={cn(
            "whitespace-nowrap border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
            pathname === tab.href
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
