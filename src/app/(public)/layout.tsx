import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserNav } from "@/components/layout/UserNav";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userName = session?.user?.name;

  return (
    <div className="min-h-screen bg-[#050505] text-white relative overflow-hidden flex flex-col">
      {/* Subtle background orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#ff4d00]/5 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8b5cf6]/4 blur-[150px]" />
        <div
          className="absolute inset-0 opacity-[0.012]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/[0.06]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff4d00] to-[#ff6b35]">
                <span className="text-sm font-bold text-white">W</span>
              </div>
              <span className="text-gradient-primary">WODNation</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/competitions"
                className="text-sm text-text-secondary hover:text-white transition-colors"
              >
                Competencias
              </Link>
              {role === "ORGANIZER" || role === "ADMIN" ? (
                <Link
                  href="/dashboard"
                  className="text-sm text-text-secondary hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
              ) : null}
              {role === "ATHLETE" ? (
                <>
                  <Link
                    href="/athlete/dashboard"
                    className="text-sm text-text-secondary hover:text-white transition-colors"
                  >
                    Mis competencias
                  </Link>
                  <Link
                    href="/athlete/profile"
                    className="text-sm text-text-secondary hover:text-white transition-colors"
                  >
                    Perfil
                  </Link>
                </>
              ) : null}
            </nav>

            <div className="flex items-center gap-4">
              {session ? (
                <UserNav userName={userName} role={role} />
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm text-text-secondary hover:text-white transition-colors"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/register?role=athlete"
                    className="rounded-lg bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all"
                  >
                    Crear cuenta
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1">{children}</main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] mt-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-[#ff4d00] to-[#ff6b35]">
                <span className="text-xs font-bold text-white">W</span>
              </div>
              <span className="text-sm font-semibold text-gradient-primary">
                WODNation
              </span>
            </div>
            <p className="text-xs text-text-muted">
              El futuro de las competencias de fitness
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
