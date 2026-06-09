"use client";

import * as React from "react";
import { format, parseISO, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "./calendar";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";

export interface DatePickerProps {
  value?: string; // YYYY-MM-DD
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  name?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  className,
  minDate,
  maxDate,
  disabled,
  name,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const date = React.useMemo(() => {
    if (!value) return undefined;
    const parsed = parseISO(value);
    return isValid(parsed) ? parsed : undefined;
  }, [value]);

  const handleSelect = (d: Date) => {
    const formatted = format(d, "yyyy-MM-dd");
    onChange?.(formatted);
    setOpen(false);
  };

  const display = date
    ? format(date, "dd/MM/yyyy", { locale: es })
    : placeholder;

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
      <PopoverContent align="start" className="p-3">
        <Calendar
          value={date}
          onChange={handleSelect}
          minDate={minDate}
          maxDate={maxDate}
        />
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
              handleSelect(new Date());
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
