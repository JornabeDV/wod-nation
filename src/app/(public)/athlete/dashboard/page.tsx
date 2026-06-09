import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AthleteDashboardView } from "@/components/athlete/AthleteDashboardView";

export default async function AthleteDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ATHLETE") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Hola, {session.user.name}
        </h1>
        <p className="text-text-secondary">
          Acá podés ver todas tus competencias y resultados.
        </p>
      </div>

      <AthleteDashboardView />
    </div>
  );
}
