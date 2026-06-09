"use client";

import { useState, useEffect } from "react";
import { DatePicker } from "@/components/ui/date-picker";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { createManualRegistration } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { StatusBadge } from "@/components/dashboard/StatusBadge";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n/provider";
import {
  UserPlus,
  Users,
  Mail,
  Phone,
  Building2,
  Calendar,
  Dumbbell,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function AthletesPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const [loading, setLoading] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const { t } = useI18n();
  const d = t.dashboard.athletesPage;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const athleteName = form.get("name") as string;
    setLoading(true);
    try {
      await createManualRegistration({
        competitionId,
        categoryId: form.get("categoryId") as string,
        name: athleteName,
        email: (form.get("email") as string) || undefined,
        phone: (form.get("phone") as string) || undefined,
        gender: (form.get("gender") as string) || undefined,
        birthDate: (form.get("birthDate") as string) || undefined,
        boxName: (form.get("boxName") as string) || undefined,
      });
      toast({
        title: d.toast.addedTitle,
        description: d.toast.addedDescription.replace("{name}", athleteName),
        variant: "success",
      });
      (e.target as HTMLFormElement).reset();
      setBirthDate("");
    } catch (err) {
      toast({
        title: d.toast.errorTitle,
        description: d.toast.errorDescription,
        variant: "destructive",
      });
    }
    setLoading(false);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader title={d.title} description={d.description} />

      {/* Add athlete form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-5 flex items-center gap-2">
          <UserPlus size={14} />
          Registrar atleta manualmente
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Users size={12} />
                {d.name}
              </label>
              <input
                name="name"
                required
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Mail size={12} />
                {d.email}
              </label>
              <input
                name="email"
                type="email"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Phone size={12} />
                {d.phone}
              </label>
              <input
                name="phone"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary">{d.gender}</label>
              <select
                name="gender"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
              >
                <option value="">—</option>
                <option value="MALE">{t.dashboard.newCompetition.categories.gender.male}</option>
                <option value="FEMALE">{t.dashboard.newCompetition.categories.gender.female}</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Dumbbell size={12} />
                {d.category}
              </label>
              <CategorySelect competitionId={competitionId} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Building2 size={12} />
                {d.boxName}
              </label>
              <input
                name="boxName"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Calendar size={12} />
                {d.birthDate}
              </label>
              <DatePicker
                name="birthDate"
                value={birthDate}
                onChange={setBirthDate}
                className="h-10"
                placeholder="Seleccionar fecha"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <UserPlus size={16} />
              )}
              {loading ? d.adding : d.add}
            </button>
          </div>
        </form>
      </motion.div>

      <RegistrationsList competitionId={competitionId} />
    </div>
  );
}

function CategorySelect({ competitionId }: { competitionId: string }) {
  const [categories, setCategories] = useState<any[]>([]);
  const { t } = useI18n();

  if (categories.length === 0) {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then(setCategories);
  }

  return (
    <select
      name="categoryId"
      required
      className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
    >
      <option value="">{t.dashboard.common.select}</option>
      {categories.map((cat: any) => (
        <option key={cat.id} value={cat.id}>
          {cat.name}
        </option>
      ))}
    </select>
  );
}

function RegistrationsList({ competitionId }: { competitionId: string }) {
  const [regs, setRegs] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [prevPaidIds, setPrevPaidIds] = useState<Set<string>>(new Set());
  const { t } = useI18n();
  const d = t.dashboard.athletesPage;

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

  if (!loaded) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
        <Loader2 size={24} className="animate-spin mx-auto text-text-muted" />
      </div>
    );
  }

  if (regs.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
        <Users size={32} className="mx-auto mb-3 text-text-muted" />
        <p className="text-text-secondary">{d.table.empty}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
        <Users size={14} />
        {regs.length} inscripto{regs.length !== 1 ? "s" : ""}
      </h2>

      {regs.map((reg, i) => (
        <motion.div
          key={reg.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
          className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff4d00]/20 to-[#ff6b35]/10 text-[#ff4d00] font-bold text-sm">
              {reg.athlete.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium">{reg.athlete.name}</div>
              <div className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                <span>{reg.category.name}</span>
                {reg.athlete.boxName && (
                  <>
                    <span>·</span>
                    <span>{reg.athlete.boxName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <StatusBadge
            status={
              reg.paymentStatus.toLowerCase() === "paid" || reg.paymentStatus.toLowerCase() === "free"
                ? "paid"
                : "pending"
            }
          />
        </motion.div>
      ))}
    </div>
  );
}
