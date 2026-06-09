import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AthleteProfileForm } from "@/components/athlete/AthleteProfileForm";

export default async function AthleteProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "ATHLETE") {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Mi perfil</h1>
        <p className="text-text-secondary">
          Actualizá tus datos de atleta para que aparezcan correctamente en las competencias.
        </p>
      </div>

      <AthleteProfileForm />
    </div>
  );
}
