export type HudStat = { label: string; value: React.ReactNode; tone?: "default" | "success" | "accent" };

/** Renders values supplied by the page. Does not compute scores or completion. */
export function HudStats({ items, className = "" }: { items: HudStat[]; className?: string }) {
  return <dl className={`hud-stats ${items.length === 4 ? "hud-stats--four" : ""} ${className}`}>
    {items.map((item) => <div key={item.label} className={`hud-stat hud-stat--${item.tone ?? "default"}`}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
  </dl>;
}
