"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LayoutDashboard, LogOut } from "lucide-react";

interface UserNavProps {
  userName?: string | null;
  role?: string;
}

export function UserNav({ userName, role }: UserNavProps) {
  const isAthlete = role === "ATHLETE";
  const dashboardHref = isAthlete ? "/athlete/dashboard" : "/dashboard";

  return (
    <div className="flex items-center gap-3">
      <span className="hidden sm:block text-sm text-text-secondary">
        {userName}
      </span>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="rounded-lg bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all"
          >
            {isAthlete ? "Mi cuenta" : "Dashboard"}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 rounded-xl border border-border bg-surface-raised p-1.5 shadow-xl"
        >
          <DropdownMenuItem asChild>
            <Link
              href={dashboardHref}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-elevated cursor-pointer"
            >
              <LayoutDashboard size={14} />
              {isAthlete ? "Mi cuenta" : "Dashboard"}
            </Link>
          </DropdownMenuItem>

          {isAthlete && (
            <DropdownMenuItem asChild>
              <Link
                href="/athlete/profile"
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-text hover:bg-surface-elevated cursor-pointer"
              >
                <User size={14} />
                Perfil
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="my-1 bg-white/[0.06]" />

          <DropdownMenuItem asChild>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 cursor-pointer"
            >
              <LogOut size={14} />
              Cerrar sesión
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
