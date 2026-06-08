"use client";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export function AuthInput({ label, ...props }: AuthInputProps) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={props.id}
        className="text-sm font-medium text-text-secondary"
      >
        {label}
      </label>
      <input
        {...props}
        className="flex h-11 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-sm text-white placeholder:text-text-muted focus:outline-none focus:border-[#ff4d00]/50 focus:ring-1 focus:ring-[#ff4d00]/20 transition-all"
      />
    </div>
  );
}
