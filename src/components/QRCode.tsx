"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Share2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface QRCodeProps {
  url: string;
  label?: string;
  size?: number;
}

export function QRCodeButton({ url, label = "Compartir QR" }: { url: string; label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm text-text-secondary hover:text-text hover:border-border-hover transition-colors"
      >
        <Share2 size={14} />
        {label}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="bg-[#111111] border border-border rounded-2xl p-6 max-w-sm w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Código QR</h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-surface-raised text-text-muted"
                >
                  <X size={18} />
                </button>
              </div>
              <QRCodeDisplay url={url} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function QRCodeDisplay({ url, size = 240 }: QRCodeProps) {
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    // The QRCodeSVG renders inline, but for download we need to capture it
    const timer = setTimeout(() => {
      const svg = document.querySelector("#qr-svg-container svg");
      if (svg) {
        setSvgContent(new XMLSerializer().serializeToString(svg));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [url, size]);

  function downloadPNG() {
    const svg = document.querySelector("#qr-svg-container svg") as SVGSVGElement | null;
    if (!svg) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const urlBlob = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = size * 2;
      canvas.height = size * 2;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(urlBlob);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = "qrcode.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    img.src = urlBlob;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        id="qr-svg-container"
        className="rounded-xl border border-border bg-white p-4"
      >
        <QRCodeSVG
          value={url}
          size={size}
          level="H"
          includeMargin={false}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      </div>
      <p className="text-xs text-text-muted text-center break-all">{url}</p>
      <button
        onClick={downloadPNG}
        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
      >
        <Download size={14} />
        Descargar PNG
      </button>
    </div>
  );
}
