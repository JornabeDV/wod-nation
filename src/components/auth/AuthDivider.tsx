export function AuthDivider({ text }: { text: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-white/[0.08]" />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="bg-[#0a0a0a] px-3 text-text-muted">{text}</span>
      </div>
    </div>
  );
}
