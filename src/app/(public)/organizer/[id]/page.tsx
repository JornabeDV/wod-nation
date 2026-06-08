import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Trophy, MapPin, Calendar, Users, Mail, Phone, Globe } from "lucide-react";
import { StatusBadge } from "@/components/dashboard/StatusBadge";

export default async function OrganizerPublicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const organizer = await db.organizerProfile.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, image: true, email: true },
      },
      competitions: {
        orderBy: { startDate: "desc" },
        include: {
          _count: { select: { registrations: true } },
        },
      },
    },
  });

  if (!organizer) notFound();

  const upcoming = organizer.competitions.filter(
    (c) => c.status === "PUBLISHED" || c.status === "LIVE"
  );
  const past = organizer.competitions.filter(
    (c) => c.status === "FINISHED" || c.status === "CANCELLED"
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <div className="border-b border-white/[0.06]">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4d00] to-[#ff6b35] text-3xl font-bold shadow-lg shadow-[#ff4d00]/20">
              {organizer.user.name?.charAt(0).toUpperCase() || "W"}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {organizer.user.name}
              </h1>
              {organizer.boxName && (
                <p className="text-text-secondary mt-1 flex items-center gap-1.5">
                  <MapPin size={14} />
                  {organizer.boxName}
                </p>
              )}
              {organizer.bio && (
                <p className="text-text-secondary mt-2 text-sm max-w-lg leading-relaxed">
                  {organizer.bio}
                </p>
              )}
            </div>
          </div>

          {/* Contact / Social */}
          <div className="flex flex-wrap gap-3 mt-6">
            {organizer.user.email && (
              <a
                href={`mailto:${organizer.user.email}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-text-secondary hover:text-text transition-colors"
              >
                <Mail size={14} />
                Contactar
              </a>
            )}
            {organizer.phone && (
              <a
                href={`tel:${organizer.phone}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-text-secondary hover:text-text transition-colors"
              >
                <Phone size={14} />
                {organizer.phone}
              </a>
            )}
            {organizer.instagram && (
              <a
                href={organizer.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-text-secondary hover:text-text transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                Instagram
              </a>
            )}
            {organizer.website && (
              <a
                href={organizer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-text-secondary hover:text-text transition-colors"
              >
                <Globe size={14} />
                Web
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Competencias", value: organizer.competitions.length, icon: Trophy },
            { label: "Próximas", value: upcoming.length, icon: Calendar },
            { label: "Finalizadas", value: past.length, icon: Users },
            { label: "Atletas totales", value: organizer.competitions.reduce((s, c) => s + c._count.registrations, 0), icon: Users },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-center"
            >
              <stat.icon size={18} className="mx-auto mb-2 text-[#ff4d00]" />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-text-muted">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Competitions list */}
        <h2 className="text-lg font-semibold mb-4">Competencias</h2>
        {organizer.competitions.length === 0 ? (
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Trophy size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary">Aún no hay competencias publicadas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {organizer.competitions.map((comp) => (
              <Link
                key={comp.id}
                href={`/competitions/${comp.slug}`}
                className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff4d00]/10 text-[#ff4d00]">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <div className="font-medium">{comp.name}</div>
                    <div className="text-xs text-text-secondary flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(comp.startDate).toLocaleDateString("es-AR")}
                      </span>
                      {comp.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} />
                          {comp.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users size={10} />
                        {comp._count.registrations} atletas
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={comp.status.toLowerCase() as any} />
                  <span className="text-sm text-[#ff4d00] opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
