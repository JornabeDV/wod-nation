"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { createCategory, deleteCategory, updateCategory } from "@/lib/actions";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { toast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n/provider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tag,
  Plus,
  Trash2,
  Users,
  Loader2,
  Swords,
  Pencil,
  AlertTriangle,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  gender: string | null;
  division: string;
  divisionType: string;
  maxAthletes: number | null;
  description?: string | null;
}

export default function CategoriesPage() {
  const params = useParams();
  const competitionId = params.id as string;
  const { t } = useI18n();
  const d = t.dashboard.categoriesPage;

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        setLoaded(true);
      });
  }, [competitionId]);

  function refresh() {
    fetch(`/api/competitions/${competitionId}/categories`)
      .then((r) => r.json())
      .then(setCategories);
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    setLoading(true);
    try {
      await createCategory({
        competitionId,
        name,
        divisionType: (form.get("division") as string) || "RX",
        gender: (form.get("gender") as string) || "MALE",
        maxAthletes: parseInt(form.get("maxAthletes") as string) || undefined,
      });
      toast({
        title: d.toast.createdTitle,
        description: d.toast.createdDescription.replace("{name}", name),
        variant: "success",
      });
      (e.target as HTMLFormElement).reset();
      refresh();
    } catch {
      toast({ title: d.toast.errorTitle, description: d.toast.errorDescription, variant: "destructive" });
    }
    setLoading(false);
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing) return;
    const form = new FormData(e.currentTarget);
    const name = form.get("name") as string;
    setModalLoading(true);
    try {
      await updateCategory(editing.id, {
        name,
        divisionType: (form.get("division") as string) || undefined,
        gender: (form.get("gender") as string) || undefined,
        maxAthletes: parseInt(form.get("maxAthletes") as string) || null,
      });
      toast({
        title: "Categoría actualizada",
        description: `"${name}" se actualizó correctamente.`,
        variant: "success",
      });
      setEditing(null);
      refresh();
    } catch {
      toast({ title: "Error", description: "No se pudo actualizar la categoría.", variant: "destructive" });
    }
    setModalLoading(false);
  }

  async function handleDeleteConfirm() {
    if (!deleting) return;
    setModalLoading(true);
    try {
      await deleteCategory(deleting.id, competitionId);
      setCategories((prev) => prev.filter((c) => c.id !== deleting.id));
      toast({ title: d.toast.deleted, variant: "info" });
      setDeleting(null);
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar la categoría.", variant: "destructive" });
    }
    setModalLoading(false);
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader title={d.title} description={d.description} />

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-5 flex items-center gap-2">
          <Plus size={14} />
          {d.addTitle || "Nueva categoría"}
        </h2>

        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Tag size={12} />
                {d.name}
              </label>
              <input
                name="name"
                required
                placeholder="RX Masculino"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Swords size={12} />
                División
              </label>
              <select
                name="division"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
              >
                <option value="RX">RX</option>
                <option value="SCALED">Scaled</option>
                <option value="ELITE">Elite</option>
                <option value="BEGINNER">Beginner</option>
                <option value="MASTER">Master</option>
                <option value="TEAM">Team</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Users size={12} />
                Género
              </label>
              <select
                name="gender"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
              >
                <option value="MALE">{t.dashboard.newCompetition.categories.gender.male}</option>
                <option value="FEMALE">{t.dashboard.newCompetition.categories.gender.female}</option>
                <option value="MIXED">Mixto</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <Users size={12} />
                Cupo máximo
              </label>
              <input
                name="maxAthletes"
                type="number"
                min={1}
                placeholder="30"
                className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {loading ? d.adding : d.add}
            </button>
          </div>
        </form>
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
          <Tag size={14} />
          {categories.length} categoría{categories.length !== 1 ? "s" : ""}
        </h2>

        {!loaded ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-text-muted" />
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <Tag size={32} className="mx-auto mb-3 text-text-muted" />
            <p className="text-text-secondary">No hay categorías todavía.</p>
          </div>
        ) : (
          categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="group relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 hover:border-white/[0.12] hover:bg-white/[0.04] transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff4d00]/20 to-[#ff6b35]/10 text-[#ff4d00] text-xs font-bold">
                      {cat.division?.charAt(0) || "?"}
                    </span>
                    <h3 className="font-semibold text-base truncate">{cat.name}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap ml-11">
                    <span className="flex items-center gap-1">
                      <Swords size={10} className="text-[#ff4d00]" />
                      {cat.division}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={10} className="text-[#ff4d00]" />
                      {cat.gender}
                    </span>
                    {cat.maxAthletes && (
                      <span className="flex items-center gap-1">
                        <Users size={10} className="text-[#ff4d00]" />
                        Cupo: {cat.maxAthletes}
                      </span>
                    )}
                  </div>
                  {cat.description && (
                    <p className="text-sm text-text-secondary mt-2 ml-11 leading-relaxed">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditing(cat)}
                    className="p-2 rounded-lg hover:bg-surface-elevated hover:text-text text-text-muted"
                    title="Editar"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setDeleting(cat)}
                    className="p-2 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-text-muted"
                    title={d.delete}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar categoría</DialogTitle>
            <DialogDescription>Modificá los datos de la categoría y guardá los cambios.</DialogDescription>
          </DialogHeader>
          {editing && (
            <form id="edit-category-form" onSubmit={handleUpdate} className="space-y-4 py-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Nombre</label>
                <input
                  name="name"
                  defaultValue={editing.name}
                  required
                  className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">División</label>
                  <select
                    name="division"
                    defaultValue={editing.division || editing.divisionType || "RX"}
                    className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
                  >
                    <option value="RX">RX</option>
                    <option value="SCALED">Scaled</option>
                    <option value="ELITE">Elite</option>
                    <option value="BEGINNER">Beginner</option>
                    <option value="MASTER">Master</option>
                    <option value="TEAM">Team</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Género</label>
                  <select
                    name="gender"
                    defaultValue={editing.gender || "MALE"}
                    className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
                  >
                    <option value="MALE">Masculino</option>
                    <option value="FEMALE">Femenino</option>
                    <option value="MIXED">Mixto</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-secondary">Cupo máximo</label>
                <input
                  name="maxAthletes"
                  type="number"
                  min={1}
                  defaultValue={editing.maxAthletes ?? ""}
                  placeholder="Sin límite"
                  className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
                />
              </div>
            </form>
          )}
          <DialogFooter className="gap-2 sm:gap-2">
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.08] bg-transparent px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.04] hover:text-text"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="edit-category-form"
              disabled={modalLoading}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-5 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 transition-all hover:shadow-[#ff4d00]/30 disabled:opacity-50"
            >
              {modalLoading ? <Loader2 size={16} className="animate-spin" /> : "Guardar cambios"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleting} onOpenChange={(open) => !open && setDeleting(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-400" />
              ¿Eliminar categoría?
            </DialogTitle>
            <DialogDescription>
              Estás por eliminar <strong className="text-text">{deleting?.name}</strong>. Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 mt-4">
            <button
              type="button"
              onClick={() => setDeleting(null)}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/[0.08] bg-transparent px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-white/[0.04] hover:text-text"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              disabled={modalLoading}
              className="inline-flex h-10 items-center justify-center rounded-xl bg-red-500 px-5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-600 disabled:opacity-50"
            >
              {modalLoading ? <Loader2 size={16} className="animate-spin" /> : "Eliminar"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
