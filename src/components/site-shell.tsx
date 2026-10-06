import Link from "next/link";

const nav = [
  ["LEARN", "/learn"],
  ["PRACTICE", "/practice"],
  ["MOCK EXAM", "/mock"],
  ["PROGRESS", "/progress"],
  ["HISTORY", "/history"],
] as const;

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-slate-700/70 bg-[#090d14]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="inline-grid h-8 w-8 place-items-center border border-amber-400 bg-amber-400/10 text-sm font-bold text-amber-300 shadow-[3px_3px_0_#422006]">
              AQ
            </span>
            <span>
              <span className="block text-sm font-black tracking-[0.2em] text-amber-300">AWS QUEST</span>
              <span className="block text-[10px] uppercase tracking-[0.16em] text-slate-500">Certification Trainer</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold tracking-[0.12em] text-slate-400">
            {nav.map(([label, href]) => (
              <Link key={href} href={href} className="transition hover:text-amber-300">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      {children}
      <footer className="mx-auto max-w-7xl px-4 pb-8 pt-12 text-center text-[11px] uppercase tracking-[0.18em] text-slate-600 sm:px-6">
        Built for retrieval practice — not exam dumps.
      </footer>
    </div>
  );
}
