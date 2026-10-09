export type PanelTone = "amber" | "violet" | "teal" | "coral" | "neutral" | "success" | "danger";

/** Presentation only. Topic order does not change any stored progression data. */
export function domainTone(index: number): PanelTone {
  const tones: PanelTone[] = ["amber", "violet", "teal", "coral"];
  return tones[((index % tones.length) + tones.length) % tones.length] ?? "amber";
}

export function RetroPanel({ children, className = "", accent = false, tone = "amber", interactive = false }: {
  children: React.ReactNode;
  className?: string;
  accent?: boolean;
  tone?: PanelTone;
  interactive?: boolean;
}) {
  return <section data-tone={tone} className={`retro-panel${accent ? " retro-panel--accent" : ""}${interactive ? " retro-panel--interactive" : ""} ${className}`}>{children}</section>;
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}

export function StatusBadge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "danger" | "warning" }) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}
