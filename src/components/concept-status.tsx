import { MASTERY_WINDOW } from "@/lib/learning/mastery";
import type { ConceptClear, conceptState } from "@/lib/learning/status";
import { StatusBadge } from "./retro-panel";

type ConceptState = ReturnType<typeof conceptState>;

export function ConceptStatusBadges({ state }: { state: ConceptState }) {
  if (!state.reviewDue && !state.smallBank) return null;
  return (
    <span className="status-badges">
      {state.reviewDue ? <StatusBadge tone="danger">Review due</StatusBadge> : null}
      {state.smallBank ? <StatusBadge tone="warning">Small bank</StatusBadge> : null}
    </span>
  );
}

function clearHint(state: ConceptState, clear: ConceptClear, practice: boolean) {
  if (clear.cleared) return "Cleared";
  if (state.smallBank) return `Can't be cleared until it has ${MASTERY_WINDOW} questions`;
  if (!state.started && !practice) return "Not started";
  const where = practice ? "" : " in Practice";
  if (clear.notBefore) return `1 more correct${where} from ${clear.notBefore.toLocaleString("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" })}`;
  if (!clear.practiced) return `${MASTERY_WINDOW} correct${where} to clear`;
  return `${clear.remaining} more correct${where}`;
}

/** `practice` drops the "in Practice" hint on screens that are already Practice. */
export function ClearMeter({ state, clear, practice = false }: { state: ConceptState; clear: ConceptClear; practice?: boolean }) {
  const filled = clear.cleared ? MASTERY_WINDOW : clear.counted;
  const showCount = !clear.cleared && !state.smallBank && (state.started || practice);
  return (
    <p className="clear-meter" data-cleared={clear.cleared ? "" : undefined}>
      <span className="clear-meter__pips" aria-hidden="true">
        {Array.from({ length: MASTERY_WINDOW }, (_, index) => <span key={index} data-on={index < filled ? "" : undefined} />)}
      </span>
      <span className="sr-only">Clear progress: </span>
      {showCount ? <strong>{filled}/{MASTERY_WINDOW}</strong> : null}
      <span>{clearHint(state, clear, practice)}</span>
    </p>
  );
}
