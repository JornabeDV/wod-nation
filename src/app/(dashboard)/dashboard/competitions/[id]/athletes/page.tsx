"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createManualRegistration } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { toast } from "@/hooks/use-toast";

export default function AthletesPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    try {
      await createManualRegistration({
        competitionId,
        categoryId: form.get("categoryId") as string,
        name: form.get("name") as string,
        email: (form.get("email") as string) || undefined,
        phone: (form.get("phone") as string) || undefined,
        gender: (form.get("gender") as string) || undefined,
        birthDate: (form.get("birthDate") as string) || undefined,
        boxName: (form.get("boxName") as string) || undefined,
      });
      toast({
        title: "Athlete added",
        description: `${form.get("name")} was registered successfully.`,
        variant: "success",
      });
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      toast({
        title: "Error",
        description: "Could not register athlete. Please try again.",
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Athletes" description="Manage registrations and walk-ins." />

      <div className="rounded-xl border border-border bg-surface-raised p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" name="gender" className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
                <option value="">—</option>
                <option value="MALE">Masculino</option>
                <option value="FEMALE">Femenino</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category *</Label>
              <CategorySelect competitionId={competitionId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="boxName">Box / Affiliate</Label>
              <Input id="boxName" name="boxName" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input id="birthDate" name="birthDate" type="date" />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-glow transition-colors disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Athlete"}
            </button>
          </div>
        </form>
      </div>

      <RegistrationsList competitionId={competitionId} />
    </div>
  );
}

function CategorySelect({ competitionId }: { competitionId: string }) {
  const [categories, setCategories] = useState<any[]>([]);

  if (categories.length === 0) {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then(setCategories);
  }

  return (
    <select id="categoryId" name="categoryId" required className="flex h-9 w-full rounded-lg border border-border bg-surface px-3 py-1 text-sm">
      <option value="">Select...</option>
      {categories.map((cat: any) => (
        <option key={cat.id} value={cat.id}>{cat.name}</option>
      ))}
    </select>
  );
}

function RegistrationsList({ competitionId }: { competitionId: string }) {
  const [regs, setRegs] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [prevPaidIds, setPrevPaidIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => {
      fetch(`/api/competitions/${competitionId}/registrations`)
        .then((r) => r.json())
        .then((data: any[]) => {
          const newlyPaid = data.filter(
            (r) =>
              (r.paymentStatus === "PAID" || r.paymentStatus === "FREE") &&
              !prevPaidIds.has(r.id)
          );
          if (newlyPaid.length > 0 && prevPaidIds.size > 0) {
            newlyPaid.forEach((r) => {
              toast({
                title: "💰 Pago confirmado",
                description: `${r.athlete.name} — ${r.category.name}`,
                variant: "success",
              });
            });
          }
          setPrevPaidIds(
            new Set(
              data
                .filter((r) => r.paymentStatus === "PAID" || r.paymentStatus === "FREE")
                .map((r) => r.id)
            )
          );
          setRegs(data);
          setLoaded(true);
        });
    }, 8000);

    // Initial load
    fetch(`/api/competitions/${competitionId}/registrations`)
      .then((r) => r.json())
      .then((data: any[]) => {
        setPrevPaidIds(
          new Set(
            data
              .filter((r) => r.paymentStatus === "PAID" || r.paymentStatus === "FREE")
              .map((r) => r.id)
          )
        );
        setRegs(data);
        setLoaded(true);
      });

    return () => clearInterval(interval);
  }, [competitionId]);

  return (
    <div className="rounded-xl border border-border bg-surface-raised overflow-hidden">
      {!loaded ? (
        <div className="p-8 text-center text-sm text-text-secondary">Loading...</div>
      ) : regs.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-secondary">No athletes registered yet.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase">Payment</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((reg: any) => (
                <tr key={reg.id} className="border-b border-border/50 hover:bg-surface-elevated/50 transition-colors">
                  <td className="px-4 py-3">{reg.athlete.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{reg.category.name}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={reg.paymentStatus.toLowerCase() === "paid" || reg.paymentStatus.toLowerCase() === "free" ? "paid" : "pending"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
