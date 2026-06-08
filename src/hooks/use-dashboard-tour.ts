"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "wodnation-tour-completed";

export interface TourStep {
  target: string;
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

export const tourSteps: TourStep[] = [
  {
    target: "[data-tour='welcome']",
    title: "Bienvenido a tu Dashboard",
    description: "Acá tenés el resumen de todas tus competencias, atletas y próximos eventos.",
    position: "bottom",
  },
  {
    target: "[data-tour='stats']",
    title: "Estadísticas en tiempo real",
    description: "Seguí el crecimiento de tus competencias, atletas inscriptos e ingresos.",
    position: "bottom",
  },
  {
    target: "[data-tour='quick-actions']",
    title: "Accesos directos",
    description: "Creá competencias, gestioná las existentes o analizá resultados de forma rápida.",
    position: "top",
  },
  {
    target: "[data-tour='recent-competitions']",
    title: "Tus competencias",
    description: "Accedé al detalle de cada competencia para gestionar categorías, WODs, atletas y scores.",
    position: "top",
  },
  {
    target: "[data-tour='sidebar-competitions']",
    title: "Navegación",
    description: "Desde acá accedés a todas las secciones: Dashboard, Competencias, Perfil y más.",
    position: "right",
  },
  {
    target: "[data-tour='header-profile']",
    title: "Tu perfil",
    description: "Configurá tu cuenta, preferencias y datos del organizador.",
    position: "bottom",
  },
];

export function useDashboardTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true);

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed) {
      setHasSeenTour(false);
      // Small delay to let the page render before starting
      const timer = setTimeout(() => setIsOpen(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      closeTour();
    }
  }, [currentStep]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  }, [currentStep]);

  const closeTour = useCallback(() => {
    setIsOpen(false);
    localStorage.setItem(STORAGE_KEY, "true");
    setHasSeenTour(true);
  }, []);

  const restartTour = useCallback(() => {
    setCurrentStep(0);
    setIsOpen(true);
  }, []);

  return {
    isOpen,
    currentStep,
    hasSeenTour,
    step: tourSteps[currentStep],
    totalSteps: tourSteps.length,
    nextStep,
    prevStep,
    closeTour,
    restartTour,
  };
}
