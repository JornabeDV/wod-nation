"use client";

import * as React from "react";
import {
  format,
  addMonths,
  subMonths,
  addYears,
  subYears,
  setMonth as dfSetMonth,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  locale?: any;
  className?: string;
}

export function Calendar({
  value,
  onChange,
  minDate,
  maxDate,
  locale = es,
  className,
}: CalendarProps) {
  const [month, setMonth] = React.useState(value || new Date());
  const [view, setView] = React.useState<"days" | "months">("days");

  React.useEffect(() => {
    if (value) {
      setMonth(value);
    }
  }, [value]);

  /* ---------- Days view ---------- */
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { locale });
  const calendarEnd = endOfWeek(monthEnd, { locale });
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePrevMonth = () => setMonth((m) => subMonths(m, 1));
  const handleNextMonth = () => setMonth((m) => addMonths(m, 1));

  const weekDays = ["L", "M", "X", "J", "V", "S", "D"];

  /* ---------- Months view ---------- */
  const months = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  const handlePrevYear = () => setMonth((m) => subYears(m, 1));
  const handleNextYear = () => setMonth((m) => addYears(m, 1));

  const handleSelectMonth = (index: number) => {
    setMonth(dfSetMonth(month, index));
    setView("days");
  };

  const isMonthDisabled = (index: number) => {
    if (!minDate && !maxDate) return false;
    const firstDay = new Date(month.getFullYear(), index, 1);
    const lastDay = new Date(month.getFullYear(), index + 1, 0);
    if (minDate && lastDay < minDate) return true;
    if (maxDate && firstDay > maxDate) return true;
    return false;
  };

  const isCurrentMonth = (index: number) => {
    const now = new Date();
    return now.getFullYear() === month.getFullYear() && now.getMonth() === index;
  };

  const isSelectedMonth = (index: number) => {
    if (!value) return false;
    return value.getFullYear() === month.getFullYear() && value.getMonth() === index;
  };

  /* ---------- Render ---------- */
  return (
    <div className={cn("w-[280px] select-none", className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          type="button"
          onClick={view === "days" ? handlePrevMonth : handlePrevYear}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <AnimatePresence mode="wait">
          {view === "days" ? (
            <motion.button
              key="month-year"
              type="button"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              onClick={() => setView("months")}
              className="text-sm font-semibold text-text capitalize hover:text-primary transition-colors"
            >
              {format(month, "MMMM yyyy", { locale })}
            </motion.button>
          ) : (
            <motion.span
              key="year-only"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-semibold text-text"
            >
              {format(month, "yyyy")}
            </motion.span>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={view === "days" ? handleNextMonth : handleNextYear}
          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface-elevated transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {view === "days" ? (
          <motion.div
            key="days-view"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
          >
            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekDays.map((d) => (
                <div
                  key={d}
                  className="flex h-7 items-center justify-center text-[10px] font-medium text-text-muted uppercase tracking-wider"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-y-0.5">
              {days.map((day) => {
                const inMonth = isSameMonth(day, month);
                const selected = value ? isSameDay(day, value) : false;
                const today = isToday(day);
                const disabled =
                  (minDate && day < minDate) || (maxDate && day > maxDate);

                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => onChange?.(day)}
                    className={cn(
                      "relative flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors mx-auto",
                      !inMonth && "text-text-muted/30",
                      inMonth && !selected && !disabled && "text-text hover:bg-surface-elevated",
                      selected && "bg-primary text-white hover:bg-primary",
                      today && !selected && "border border-primary/50 text-primary",
                      disabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="months-view"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
          >
            <div className="grid grid-cols-3 gap-2">
              {months.map((mName, index) => {
                const disabled = isMonthDisabled(index);
                const current = isCurrentMonth(index);
                const selected = isSelectedMonth(index);

                return (
                  <button
                    key={mName}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectMonth(index)}
                    className={cn(
                      "flex h-10 items-center justify-center rounded-lg text-sm font-medium transition-colors",
                      selected && "bg-primary text-white hover:bg-primary",
                      !selected && !disabled && "text-text hover:bg-surface-elevated",
                      current && !selected && "border border-primary/50 text-primary",
                      disabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    {mName}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
