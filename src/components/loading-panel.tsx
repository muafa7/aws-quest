import { Eyebrow, RetroPanel, type PanelTone } from "./retro-panel";

export function LoadingPage({ eyebrow, message, tone = "violet" }: { eyebrow: string; message: string; tone?: PanelTone }) {
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap" aria-busy="true">
      <RetroPanel tone={tone} className="loading-panel">
        <Eyebrow>{eyebrow}</Eyebrow>
        <p role="status">{message}</p>
      </RetroPanel>
    </main>
  );
}
