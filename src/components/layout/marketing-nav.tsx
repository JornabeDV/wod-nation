"use client";

import Link from "next/link";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function MarketingNav() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold tracking-tight">WODNation</span>
        </Link>
        <nav className="flex flex-1 items-center justify-end space-x-4">
          {session ? (
            <Button asChild size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <Button size="sm" onClick={() => signIn("google")}>
              Iniciar sesión
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
