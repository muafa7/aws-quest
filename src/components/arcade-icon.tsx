import type { SVGProps } from "react";

export type ArcadeIconName = "learn" | "practice" | "mock" | "progress" | "history" | "arrow" | "external" | "back" | "check" | "close" | "cloud" | "clock" | "layers";

const paths: Record<ArcadeIconName, React.ReactNode> = {
  learn: <><path d="M12 5v15M3 4h5a4 4 0 0 1 4 2 4 4 0 0 1 4-2h5v15h-5a5 5 0 0 0-4 2 5 5 0 0 0-4-2H3z" /></>,
  practice: <><path d="m13 2-9 12h7l-1 8 10-12h-7z" /></>,
  mock: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V2h6v2M9 10h6M9 14h6M9 18h3" /></>,
  progress: <><path d="M4 20V10M10 20V4M16 20v-8M22 20H2" /></>,
  history: <><path d="M3 10a9 9 0 1 1 1.9 7.5M3 4v6h6M12 7v5l3 2" /></>,
  arrow: <><path d="M4 12h16m-6-6 6 6-6 6" /></>,
  external: <><path d="M8 5H5v14h14v-3M11 3h10v10M10 14 21 3" /></>,
  back: <><path d="M20 12H4m6-6-6 6 6 6" /></>,
  check: <><path d="m5 12 4 4L19 6" /></>,
  close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  cloud: <><path d="M6 18a5 5 0 0 1-1-9.9 7 7 0 0 1 13-1.5A5.7 5.7 0 0 1 18 18z" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></>,
  layers: <><path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5" /></>,
};

export function ArcadeIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: ArcadeIconName }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>{paths[name]}</svg>;
}
