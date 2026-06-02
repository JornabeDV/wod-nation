"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { createCompetition, createCategory, createWOD } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Trophy,
  Calendar,
  MapPin,
  FileText,
  Layers,
  Dumbbell,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
} from "lucide-react";

const steps = [
  { id: 1, label: "Info", icon: FileText },
  { id: 2, label: "Categories", icon: Layers },
  { id: 3, label: "WODs", icon: Dumbbell },
  { id: 4, label: "Registration", icon: CreditCard },
  { id: 5, label: "Review", icon: CheckCircle },
];

export default function NewCompetitionWizard() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Info
  const [info, setInfo] = useState({
    name: "",
    description: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  // Step 2: Categories
  const [categories, setCategories] = useState<
    { name: string; gender: string; divisionType: string }[]
  >([
    { name: "RX Masculino", gender: "MALE", divisionType: "RX" },
    { name: "RX Femenino", gender: "FEMALE", divisionType: "RX" },
    { name: "Scaled Masculino", gender: "MALE", divisionType: "SCALED" },
    { name: "Scaled Femenino", gender: "FEMALE", divisionType: "SCALED" },
  ]);

  // Step 3: WODs
  const [wods, setWods] = useState<
    { name: string; scoringType: string; timeCapMinutes: string; description: string }[]
  >([
    { name: "WOD 1", scoringType: "FOR_TIME", timeCapMinutes: "10", description: "" },
    { name: "WOD 2", scoringType: "AMRAP", timeCapMinutes: "20", description: "" },
    { name: "WOD 3", scoringType: "MAX_WEIGHT", timeCapMinutes: "6", description: "" },
  ]);

  // Step 4: Registration
  const [registration, setRegistration] = useState({
    fee: "0",
    deadline: "",
    maxAthletes: "",
  });

  const canProceed = () => {
    switch (step) {
      case 1:
        return info.name && info.startDate;
      case 2:
        return categories.length > 0 && categories.every((c) => c.name);
      case 3:
        return wods.length > 0 && wods.every((w) => w.name);
      case 4:
        return true;
      default:
        return true;
    }
  };

  async function handleSubmit() {
    if (!session?.user?.id) return;
    setLoading(true);

    try {
      const comp = await createCompetition({
        name: info.name,
        description: info.description,
        location: info.location,
        startDate: info.startDate,
        endDate: info.endDate || undefined,
        registrationDeadline: registration.deadline || undefined,
        registrationFee: Number(registration.fee) * 100,
        maxAthletes: registration.maxAthletes ? Number(registration.maxAthletes) : undefined,
        organizerId: session.user.id,
      });

      for (const cat of categories) {
        await createCategory({
          competitionId: comp.id,
          name: cat.name,
          gender: cat.gender,
          divisionType: cat.divisionType,
        });
      }

      for (const wod of wods) {
        await createWOD({
          competitionId: comp.id,
          name: wod.name,
          description: wod.description,
          scoringType: wod.scoringType as any,
          timeCapMinutes: wod.timeCapMinutes ? Number(wod.timeCapMinutes) : undefined,
        });
      }

      router.push(`/dashboard/competitions/${comp.id}`);
    } catch (err) {
      alert("Error creating competition");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="New Competition"
        description="Set up your event in a few simple steps."
        backHref="/dashboard/competitions"
      />

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{
                    backgroundColor: step >= s.id ? "#ff4d00" : "#1a1a1a",
                    borderColor: step >= s.id ? "#ff4d00" : "#27272a",
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors"
                >
                  <s.icon
                    size={18}
                    className={step >= s.id ? "text-white" : "text-text-muted"}
                  />
                </motion.div>
                <span
                  className={`text-xs mt-1.5 font-medium ${
                    step >= s.id ? "text-text" : "text-text-muted"
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-12 sm:w-20 h-px bg-border mx-2 sm:mx-4 relative">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: step > s.id ? "100%" : "0%" }}
                    transition={{ duration: 0.4 }}
                    className="absolute inset-y-0 left-0 bg-primary"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl border border-border bg-surface-raised p-6"
        >
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Competition Info</h2>
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={info.name}
                  onChange={(e) => setInfo({ ...info, name: e.target.value })}
                  placeholder="Summer Throwdown 2026"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <textarea
                  value={info.description}
                  onChange={(e) => setInfo({ ...info, description: e.target.value })}
                  rows={3}
                  className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:outline-none focus:border-border-hover"
                  placeholder="Describe your competition..."
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={info.location}
                  onChange={(e) => setInfo({ ...info, location: e.target.value })}
                  placeholder="CrossFit Mendoza"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={info.startDate}
                    onChange={(e) => setInfo({ ...info, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="datetime-local"
                    value={info.endDate}
                    onChange={(e) => setInfo({ ...info, endDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Categories</h2>
                <button
                  onClick={() =>
                    setCategories([...categories, { name: "", gender: "MALE", divisionType: "CUSTOM" }])
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
              {categories.map((cat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <Input
                    value={cat.name}
                    onChange={(e) => {
                      const updated = [...categories];
                      updated[i].name = e.target.value;
                      setCategories(updated);
                    }}
                    placeholder="Category name"
                    className="flex-1"
                  />
                  <select
                    value={cat.gender}
                    onChange={(e) => {
                      const updated = [...categories];
                      updated[i].gender = e.target.value;
                      setCategories(updated);
                    }}
                    className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="MIXED">Mixed</option>
                  </select>
                  <select
                    value={cat.divisionType}
                    onChange={(e) => {
                      const updated = [...categories];
                      updated[i].divisionType = e.target.value;
                      setCategories(updated);
                    }}
                    className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
                  >
                    <option value="RX">RX</option>
                    <option value="SCALED">Scaled</option>
                    <option value="ELITE">Elite</option>
                    <option value="MASTER">Master</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                  <button
                    onClick={() => setCategories(categories.filter((_, idx) => idx !== i))}
                    className="p-2 text-text-muted hover:text-red-400 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">WODs</h2>
                <button
                  onClick={() =>
                    setWods([...wods, { name: "", scoringType: "AMRAP", timeCapMinutes: "", description: "" }])
                  }
                  className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
                >
                  <Plus size={14} />
                  Add
                </button>
              </div>
              {wods.map((wod, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="space-y-3 p-4 rounded-lg border border-border bg-surface"
                >
                  <div className="flex items-center gap-3">
                    <Input
                      value={wod.name}
                      onChange={(e) => {
                        const updated = [...wods];
                        updated[i].name = e.target.value;
                        setWods(updated);
                      }}
                      placeholder="WOD name"
                      className="flex-1"
                    />
                    <select
                      value={wod.scoringType}
                      onChange={(e) => {
                        const updated = [...wods];
                        updated[i].scoringType = e.target.value;
                        setWods(updated);
                      }}
                      className="h-9 rounded-lg border border-border bg-surface px-3 text-sm"
                    >
                      <option value="AMRAP">AMRAP</option>
                      <option value="FOR_TIME">For Time</option>
                      <option value="EMOM">EMOM</option>
                      <option value="MAX_WEIGHT">Max Weight</option>
                      <option value="POINTS">Points</option>
                    </select>
                    <Input
                      value={wod.timeCapMinutes}
                      onChange={(e) => {
                        const updated = [...wods];
                        updated[i].timeCapMinutes = e.target.value;
                        setWods(updated);
                      }}
                      placeholder="Min"
                      className="w-20"
                      type="number"
                    />
                    <button
                      onClick={() => setWods(wods.filter((_, idx) => idx !== i))}
                      className="p-2 text-text-muted hover:text-red-400 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <textarea
                    value={wod.description}
                    onChange={(e) => {
                      const updated = [...wods];
                      updated[i].description = e.target.value;
                      setWods(updated);
                    }}
                    rows={2}
                    className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                    placeholder="WOD description..."
                  />
                </motion.div>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold mb-4">Registration Settings</h2>
              <div className="space-y-2">
                <Label>Registration Fee ($)</Label>
                <Input
                  value={registration.fee}
                  onChange={(e) => setRegistration({ ...registration, fee: e.target.value })}
                  type="number"
                  min="0"
                  placeholder="0 = Free"
                />
              </div>
              <div className="space-y-2">
                <Label>Registration Deadline</Label>
                <Input
                  type="datetime-local"
                  value={registration.deadline}
                  onChange={(e) => setRegistration({ ...registration, deadline: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Athletes (optional)</Label>
                <Input
                  value={registration.maxAthletes}
                  onChange={(e) => setRegistration({ ...registration, maxAthletes: e.target.value })}
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold mb-4">Review</h2>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-surface">
                  <h3 className="text-sm font-medium text-text-muted mb-2">INFO</h3>
                  <p className="font-medium">{info.name}</p>
                  <p className="text-sm text-text-secondary">{info.location}</p>
                  <p className="text-sm text-text-secondary">
                    {info.startDate && new Date(info.startDate).toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface">
                  <h3 className="text-sm font-medium text-text-muted mb-2">CATEGORIES</h3>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <span key={cat.name} className="rounded-full bg-surface-raised border border-border px-3 py-1 text-sm">
                        {cat.name}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface">
                  <h3 className="text-sm font-medium text-text-muted mb-2">WODS</h3>
                  <div className="space-y-1">
                    {wods.map((wod) => (
                      <div key={wod.name} className="text-sm">
                        {wod.name} · {wod.scoringType}
                        {wod.timeCapMinutes ? ` · ${wod.timeCapMinutes}min` : ""}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-lg border border-border bg-surface">
                  <h3 className="text-sm font-medium text-text-muted mb-2">REGISTRATION</h3>
                  <p className="text-sm">
                    Fee: {registration.fee === "0" ? "Free" : `$${registration.fee}`}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {registration.maxAthletes
                      ? `Max ${registration.maxAthletes} athletes`
                      : "Unlimited athletes"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text hover:border-border-hover transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          Back
        </button>

        {step < 5 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-glow transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-glow transition-colors disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Competition"}
            <CheckCircle size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
