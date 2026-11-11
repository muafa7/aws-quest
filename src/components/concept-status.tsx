import type { ConceptClear, conceptState } from "@/lib/learning/status";
import { StatusBadge } from "./retro-panel";

type ConceptState = ReturnType<typeof conceptState>;

export function ConceptStatusBadges({ state }: { state: ConceptState }) {
  if (!state.reviewDue) return null;
  return (
    <span className="status-badges">
      <StatusBadge tone="danger">Review due</StatusBadge>
    </span>
  );
}

function clearHint(clear: ConceptClear) {
  if (clear.total === 0) return "No challenges yet";
  if (clear.cleared) return "Cleared";
  if (clear.done === 0) return "Not started";
  return `${clear.remaining} challenge${clear.remaining === 1 ? "" : "s"} left`;
}

export function ClearMeter({ clear }: { clear: ConceptClear }) {
  return (
    <p className="clear-meter" data-cleared={clear.cleared ? "" : undefined}>
      <span className="sr-only">Challenge progress: </span>
      {clear.total > 0 ? <strong>{clear.done}/{clear.total}</strong> : null}
      <span>{clearHint(clear)}</span>
    </p>
  );
}
