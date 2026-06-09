"use client";

import { useRef } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface LeaderboardExportProps {
  competitionName: string;
  categoryName: string;
  leaderboardData: {
    wods: { id: string; name: string }[];
    rows: {
      athleteId: string;
      athleteName: string;
      boxName: string | null;
      overallRank: number;
      totalPoints: number;
      wodScores: { wodId: string; rawScore: string; points: number }[];
    }[];
  } | null;
}

export function LeaderboardExport({
  competitionName,
  categoryName,
  leaderboardData,
}: LeaderboardExportProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  function exportCSV() {
    if (!leaderboardData) return;
    const { wods, rows } = leaderboardData;

    const headers = ["Rank", "Athlete", "Box", ...wods.map((w) => w.name), "Total Points"];
    const lines = rows.map((row) => [
      row.overallRank,
      row.athleteName,
      row.boxName || "",
      ...row.wodScores.map((ws) => `${ws.rawScore} (${ws.points}pts)`),
      row.totalPoints,
    ]);

    const csv = [headers, ...lines]
      .map((line) =>
        line
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${competitionName}_${categoryName}_leaderboard.csv`.replace(/\s+/g, "_");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    if (!tableRef.current || !leaderboardData) return;

    const canvas = await html2canvas(tableRef.current, {
      backgroundColor: "#0a0a0a",
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 10;
    const imgWidth = pageWidth - margin * 2;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.setFillColor(5, 5, 5);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text(competitionName, margin, margin + 5);
    pdf.setFontSize(11);
    pdf.text(`Leaderboard — ${categoryName}`, margin, margin + 12);

    let y = margin + 18;
    if (imgHeight + y > pageHeight - margin) {
      const scale = (pageHeight - margin - y) / imgHeight;
      pdf.addImage(imgData, "PNG", margin, y, imgWidth * scale, (imgHeight * scale));
    } else {
      pdf.addImage(imgData, "PNG", margin, y, imgWidth, imgHeight);
    }

    pdf.save(`${competitionName}_${categoryName}_leaderboard.pdf`.replace(/\s+/g, "_"));
  }

  return (
    <>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={exportCSV}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
        >
          <FileSpreadsheet size={12} className="sm:w-[14px] sm:h-[14px]" />
          CSV
        </button>
        <button
          onClick={exportPDF}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs sm:px-3 sm:py-2 sm:text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
        >
          <FileText size={12} className="sm:w-[14px] sm:h-[14px]" />
          PDF
        </button>
      </div>

      {/* Hidden printable table for PDF capture */}
      <div className="sr-only">
        <div ref={tableRef} className="p-6 bg-[#0a0a0a] text-white">
          <h2 className="text-xl font-bold mb-1">{competitionName}</h2>
          <p className="text-sm text-gray-400 mb-4">Leaderboard — {categoryName}</p>
          {leaderboardData && (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-left py-2 px-3">Athlete</th>
                  <th className="text-left py-2 px-3">Box</th>
                  {leaderboardData.wods.map((wod) => (
                    <th key={wod.id} className="text-center py-2 px-3">{wod.name}</th>
                  ))}
                  <th className="text-center py-2 px-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.rows.map((row) => (
                  <tr key={row.athleteId} className="border-b border-gray-800">
                    <td className="py-2 px-3">{row.overallRank}</td>
                    <td className="py-2 px-3 font-medium">{row.athleteName}</td>
                    <td className="py-2 px-3 text-gray-400">{row.boxName || "—"}</td>
                    {row.wodScores.map((ws) => (
                      <td key={ws.wodId} className="py-2 px-3 text-center">
                        {ws.rawScore}
                        <span className="text-gray-500 text-xs ml-1">({ws.points}pts)</span>
                      </td>
                    ))}
                    <td className="py-2 px-3 text-center font-bold">{row.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
