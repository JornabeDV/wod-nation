"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet } from "lucide-react";
import { submitScore } from "@/lib/actions";
import { toast } from "@/hooks/use-toast";

interface BulkScoreUploadProps {
  competitionId: string;
  wodId: string;
  categoryId: string;
  athletes: { athleteId: string; name: string }[];
}

export function BulkScoreUpload({ competitionId, wodId, categoryId, athletes }: BulkScoreUploadProps) {
  const [csvText, setCsvText] = useState("");
  const [parsed, setParsed] = useState<{ athleteId: string; name: string; rawScore: string; value: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function downloadTemplate() {
    const headers = ["athlete_name", "score"];
    const rows = athletes.map((a) => `"${a.name}",""`);
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "score_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function parseCSV(text: string) {
    const lines = text.trim().split("\n").filter((l) => l.trim());
    if (lines.length < 2) {
      setParsed([]);
      return;
    }

    const results: typeof parsed = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(/("[^"]*"|[^,]*)/g);
      if (!matches || matches.length < 2) continue;

      const name = matches[0].replace(/^"|"$/g, "").trim();
      const rawScore = matches[1].replace(/^"|"$/g, "").trim();

      if (!rawScore) continue;

      const athlete = athletes.find((a) => a.name.toLowerCase() === name.toLowerCase());
      if (!athlete) continue;

      let value = 0;
      if (rawScore.includes(":")) {
        const parts = rawScore.split(":").map(Number);
        if (parts.length === 2) value = parts[0] * 60 + parts[1];
        else if (parts.length === 3) value = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else {
        value = Number(rawScore) || 0;
      }

      results.push({ athleteId: athlete.athleteId, name: athlete.name, rawScore, value });
    }

    setParsed(results);
  }

  async function submitAll() {
    if (parsed.length === 0) return;
    setLoading(true);

    let success = 0;
    let failed = 0;

    for (const row of parsed) {
      try {
        await submitScore({
          competitionId,
          wodId,
          categoryId,
          athleteId: row.athleteId,
          rawScore: row.rawScore,
          value: row.value,
        });
        success++;
      } catch {
        failed++;
      }
    }

    setLoading(false);
    toast({
      title: "Scores cargados",
      description: `${success} guardados${failed > 0 ? `, ${failed} fallidos` : ""}`,
      variant: failed > 0 ? "default" : "success",
    });
    setCsvText("");
    setParsed([]);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSpreadsheet size={16} className="text-[#ff4d00]" />
          <span className="text-sm font-medium text-text-secondary">Carga masiva (CSV)</span>
        </div>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text transition-colors"
        >
          <Download size={12} />
          Descargar plantilla
        </button>
      </div>

      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        className="relative rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] p-6 text-center cursor-pointer hover:border-[#ff4d00]/40 hover:bg-[#ff4d00]/[0.02] transition-all"
      >
        <Upload size={24} className="mx-auto mb-2 text-text-muted" />
        <p className="text-sm text-text-secondary">Click para subir CSV o arrastrá el archivo</p>
        <p className="text-xs text-text-muted mt-1">Formato: athlete_name, score</p>
      </div>

      {csvText && (
        <textarea
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            parseCSV(e.target.value);
          }}
          rows={4}
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-[#ff4d00]/50 transition-all"
          placeholder="athlete_name,score&#10;Juan Perez,150&#10;Maria Gomez,10:23"
        />
      )}

      <AnimatePresence>
        {parsed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-950/20 p-4"
          >
            <div className="flex items-center gap-2 text-emerald-400 text-sm mb-3">
              <CheckCircle2 size={16} />
              <span className="font-medium">{parsed.length} scores listos para guardar</span>
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {parsed.map((p) => (
                <div key={p.athleteId} className="flex justify-between text-xs text-text-secondary">
                  <span>{p.name}</span>
                  <span className="font-mono text-white">{p.rawScore}</span>
                </div>
              ))}
            </div>
            <button
              onClick={submitAll}
              disabled={loading}
              className="mt-3 w-full rounded-xl bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all disabled:opacity-50"
            >
              {loading ? "Guardando..." : `Guardar ${parsed.length} scores`}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {csvText && parsed.length === 0 && (
        <div className="flex items-center gap-2 text-amber-400 text-sm">
          <AlertCircle size={16} />
          <span>No se encontraron scores válidos. Verificá el formato.</span>
        </div>
      )}
    </div>
  );
}
