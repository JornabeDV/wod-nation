import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard/PageHeader";
import {
  LayoutGrid,
  Layers,
  Dumbbell,
  Users,
  PenTool,
  Settings,
} from "lucide-react";

const tabs = [
  { label: "Overview", href: "", icon: LayoutGrid },
  { label: "Categories", href: "/categories", icon: Layers },
  { label: "WODs", href: "/wods", icon: Dumbbell },
  { label: "Athletes", href: "/athletes", icon: Users },
  { label: "Scores", href: "/scores", icon: PenTool },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default async function CompetitionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;

  const competition = await db.competition.findUnique({
    where: { id },
    include: { organizer: true },
  });

  if (!competition || competition.organizer.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={competition.name}
        description={`${competition.location || "No location"} · ${new Date(
          competition.startDate
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`}
        backHref="/dashboard/competitions"
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-surface-raised border border-border overflow-x-auto">
        {tabs.map((tab) => {
          // Simple check: we need to know current path
          // Since we're in a layout, we can't easily get the full pathname
          // We'll use a client component for active state
          return (
            <Link
              key={tab.href}
              href={`/dashboard/competitions/${id}${tab.href}`}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                "text-text-secondary hover:text-text hover:bg-surface-elevated"
              )}
            >
              <tab.icon size={16} />
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
