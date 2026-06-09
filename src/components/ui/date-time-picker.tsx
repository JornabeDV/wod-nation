"use client";

import * as React from "react";
import { format, parseISO, isValid, setHours, setMinutes, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

export interface DateTimePickerProps {
  value?: string; // YYYY-MM-DDTHH:mm
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  name?: string;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha y hora",
  className,
  minDate,
  maxDate,
  disabled,
  name,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleDateSelect = (d: Date) => {
    const base = date || startOfDay(new Date());
    const merged = setMinutes(setHours(d, base.getHours()), base.getMinutes());
    onChange?.(format(merged, "yyyy-MM-dd'T'HH:mm"));
  };

  const handleTimeChange = (hours: number, minutes: number) => {
    const base = date || startOfDay(new Date());
    const merged = setMinutes(setHours(base, hours), minutes);
    onChange?.(format(merged, "yyyy-MM-dd'T'HH:mm"));
  };

  const display = date
    ? format(date, "dd/MM/yyyy HH:mm", { locale: es })
    : placeholder;

  const hours = date ? pad(date.getHours()) : "";
  const minutes = date ? pad(date.getMinutes()) : "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 text-sm transition-all",
            "hover:border-white/[0.12] focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20",
            disabled && "opacity-50 cursor-not-allowed",
            !date && "text-text-muted",
            className
          )}
        >
          <span className={cn(!date && "text-text-muted")}>{display}</span>
          <div className="flex items-center gap-2">
            {date && onChange && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.stopPropagation();
                    onChange("");
                  }
                }}
                className="inline-flex text-text-muted hover:text-text transition-colors"
              >
                <X size={14} />
              </span>
            )}
            <CalendarIcon size={16} className="text-text-muted" />
          </div>
        </button>
      </PopoverTrigger>
      {name && <input type="hidden" name={name} value={value || ""} />}
      <PopoverContent align="start" className="p-3 w-auto">
        <Calendar
          value={date}
          onChange={handleDateSelect}
          minDate={minDate}
          maxDate={maxDate}
        />

        {/* Time selector */}
        <div className="mt-2 border-t border-border pt-3">
          <div className="flex items-center justify-center gap-2">
            <Clock size={14} className="text-text-muted mr-1" />
            <input
              type="number"
              min={0}
              max={23}
              value={hours}
              placeholder="--"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 23) {
                  handleTimeChange(val, date ? date.getMinutes() : 0);
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 0 || val > 23) {
                  handleTimeChange(0, date ? date.getMinutes() : 0);
                }
              }}
              className="w-12 h-8 rounded-lg border border-border bg-surface text-center text-sm text-text placeholder:text-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors"
            />
            <span className="text-text-muted text-sm">:</span>
            <input
              type="number"
              min={0}
              max={59}
              value={minutes}
              placeholder="--"
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                if (!isNaN(val) && val >= 0 && val <= 59) {
                  handleTimeChange(date ? date.getHours() : 0, val);
                }
              }}
              onBlur={(e) => {
                const val = parseInt(e.target.value, 10);
                if (isNaN(val) || val < 0 || val > 59) {
                  handleTimeChange(date ? date.getHours() : 0, 0);
                }
              }}
              className="w-12 h-8 rounded-lg border border-border bg-surface text-center text-sm text-text placeholder:text-text-muted focus:border-primary/50 focus:ring-1 focus:ring-primary/20 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
          <button
            type="button"
            onClick={() => onChange?.("")}
            className="text-xs text-text-muted hover:text-text transition-colors"
          >
            Borrar
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              onChange?.(format(now, "yyyy-MM-dd'T'HH:mm"));
              setOpen(false);
            }}
            className="text-xs font-medium text-primary hover:text-primary-glow transition-colors"
          >
            Hoy
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
