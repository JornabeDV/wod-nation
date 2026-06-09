import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AthleteDashboardView } from "@/components/athlete/AthleteDashboardView";

export default async function RegistrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mis inscripciones</h1>
        <p className="text-text-secondary mt-1">
          Todas las competencias en las que estás anotado.
        </p>
      </div>

      <AthleteDashboardView />
    </div>
  );
}
