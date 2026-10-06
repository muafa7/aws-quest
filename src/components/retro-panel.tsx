export function RetroPanel({
  children,
  className = "",
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
}) {
  return (
    <section
      className={`retro-panel border ${accent ? "border-amber-400/60" : "border-slate-700"} bg-[#0d1420] p-5 shadow-[5px_5px_0_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </section>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-300">{children}</p>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "danger" | "warning" }) {
  const tones = {
    neutral: "border-slate-600 bg-slate-800/70 text-slate-300",
    success: "border-emerald-700 bg-emerald-950/60 text-emerald-300",
    danger: "border-red-800 bg-red-950/60 text-red-300",
    warning: "border-amber-700 bg-amber-950/60 text-amber-300",
  };
  return <span className={`inline-flex border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${tones[tone]}`}>{children}</span>;
}
