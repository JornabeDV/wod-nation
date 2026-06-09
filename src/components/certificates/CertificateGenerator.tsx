"use client";

import { jsPDF } from "jspdf";
import { Award } from "lucide-react";

interface CertificateData {
  athleteName: string;
  competitionName: string;
  categoryName?: string;
  date: string;
  rank?: number;
}

export function CertificateGenerator({
  athleteName,
  competitionName,
  categoryName,
  date,
  rank,
}: CertificateData) {
  function generatePDF() {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const centerX = pageWidth / 2;

    doc.setFillColor(5, 5, 5);
    doc.rect(0, 0, pageWidth, pageHeight, "F");

    doc.setDrawColor(255, 77, 0);
    doc.setLineWidth(1.5);
    doc.roundedRect(15, 15, pageWidth - 30, pageHeight - 30, 3, 3, "S");

    doc.setDrawColor(255, 107, 53);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, 20, pageWidth - 40, pageHeight - 40, 2, 2, "S");

    doc.setFillColor(255, 77, 0);
    doc.roundedRect(centerX - 12, 35, 24, 24, 4, 4, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("W", centerX, 51, { align: "center", baseline: "middle" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(32);
    doc.setFont("helvetica", "bold");
    doc.text("CERTIFICADO DE PARTICIPACIÓN", centerX, 85, { align: "center" });

    doc.setTextColor(161, 161, 170);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("WODNation reconoce la participación de", centerX, 100, { align: "center" });

    doc.setTextColor(255, 77, 0);
    doc.setFontSize(42);
    doc.setFont("helvetica", "bold");
    doc.text(athleteName, centerX, 125, { align: "center" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont("helvetica", "normal");
    doc.text(`en la competencia "${competitionName}"`, centerX, 145, { align: "center" });

    if (categoryName) {
      doc.setTextColor(161, 161, 170);
      doc.setFontSize(12);
      doc.text(`Categoría: ${categoryName}`, centerX, 155, { align: "center" });
    }

    if (rank) {
      doc.setTextColor(255, 77, 0);
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text(`${rank}° puesto`, centerX, 170, { align: "center" });
    }

    doc.setTextColor(113, 113, 122);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(date, centerX, 180, { align: "center" });

    doc.setDrawColor(255, 77, 0);
    doc.setLineWidth(0.3);
    doc.line(centerX - 40, pageHeight - 45, centerX + 40, pageHeight - 45);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text("WODNation — El Futuro de las Competiciones de Fitness", centerX, pageHeight - 35, { align: "center" });

    doc.save(`certificado-${athleteName.replace(/\s+/g, "_")}.pdf`);
  }

  return (
    <button
      onClick={generatePDF}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
    >
      <Award size={14} />
      Certificado
    </button>
  );
}
