"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronRight, ChevronLeft, Sparkles } from "lucide-react";
import { useDashboardTour, tourSteps } from "@/hooks/use-dashboard-tour";

export function DashboardTour() {
  const tour = useDashboardTour();
  if (!tour.isOpen) return null;
  return <TourOverlay tour={tour} />;
}

function TourOverlay({ tour }: { tour: ReturnType<typeof useDashboardTour> }) {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = tour.step;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function updateRect() {
      const el = document.querySelector(step.target);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }
    }

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    const interval = setInterval(updateRect, 300);
    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
      clearInterval(interval);
    };
  }, [step.target, tour.currentStep]);

  const tooltipPos = getTooltipPosition(targetRect, step.position);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
      >
        {/* Dark overlay with cutout */}
        <svg className="absolute inset-0 w-full h-full">
          <defs>
            <mask id="tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetRect && (
                <rect
                  x={targetRect.left - 8}
                  y={targetRect.top - 8}
                  width={targetRect.width + 16}
                  height={targetRect.height + 16}
                  rx="12"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0,0,0,0.65)"
            mask="url(#tour-mask)"
          />
        </svg>

        {/* Spotlight border */}
        {targetRect && (
          <motion.div
            layoutId="tour-spotlight"
            className="absolute pointer-events-none rounded-xl border-2 border-[#ff4d00]/60"
            style={{
              left: targetRect.left - 8,
              top: targetRect.top - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="absolute -inset-1 rounded-xl bg-[#ff4d00]/10 animate-pulse" />
          </motion.div>
        )}

        {/* Tooltip */}
        {tooltipPos && (
          <motion.div
            key={tour.currentStep}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute z-10 w-80"
            style={{ left: tooltipPos.x, top: tooltipPos.y }}
          >
            <div className="rounded-2xl border border-white/[0.08] bg-[#111111]/95 backdrop-blur-xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-[#ff4d00]">
                  <Sparkles size={16} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    Tour ({tour.currentStep + 1}/{tour.totalSteps})
                  </span>
                </div>
                <button
                  onClick={tour.closeTour}
                  className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <h3 className="text-lg font-bold mb-1">{step.title}</h3>
              <p className="text-sm text-text-secondary leading-relaxed mb-5">
                {step.description}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {tourSteps.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all ${
                        i === tour.currentStep
                          ? "w-6 bg-[#ff4d00]"
                          : i < tour.currentStep
                          ? "w-1.5 bg-emerald-500"
                          : "w-1.5 bg-white/20"
                      }`}
                    />
                  ))}
                </div>

                <div className="flex gap-2">
                  {tour.currentStep > 0 && (
                    <button
                      onClick={tour.prevStep}
                      className="inline-flex items-center gap-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                    >
                      <ChevronLeft size={14} />
                    </button>
                  )}
                  <button
                    onClick={tour.nextStep}
                    className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-[#ff4d00] to-[#ff6b35] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#ff4d00]/20 hover:shadow-[#ff4d00]/30 transition-all"
                  >
                    {tour.currentStep === tour.totalSteps - 1 ? "Finalizar" : "Siguiente"}
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function getTooltipPosition(
  targetRect: DOMRect | null,
  position: string = "bottom"
): { x: number; y: number } | null {
  if (!targetRect) return null;

  const tooltipWidth = 320;
  const tooltipHeight = 200;
  const gap = 20;

  let x = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
  let y = targetRect.bottom + gap;

  if (position === "top") {
    y = targetRect.top - tooltipHeight - gap;
  } else if (position === "left") {
    x = targetRect.left - tooltipWidth - gap;
    y = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
  } else if (position === "right") {
    x = targetRect.right + gap;
    y = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
  }

  // Clamp to viewport
  x = Math.max(16, Math.min(x, window.innerWidth - tooltipWidth - 16));
  y = Math.max(16, Math.min(y, window.innerHeight - tooltipHeight - 16));

  return { x, y };
}
