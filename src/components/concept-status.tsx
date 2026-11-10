import type { conceptState } from "@/lib/learning/status";
import { StatusBadge } from "./retro-panel";

export function ConceptStatusBadges({ state }: { state: ReturnType<typeof conceptState> }) {
  return (
    <span className="status-badges">
      {state.status === "CLEARED" ? <StatusBadge tone="success">Cleared</StatusBadge> : state.status === "IN_PROGRESS" ? <StatusBadge>In progress</StatusBadge> : <StatusBadge>New</StatusBadge>}
      {state.reviewDue ? <StatusBadge tone="danger">Review due</StatusBadge> : null}
      {state.smallBank ? <StatusBadge tone="warning">Small bank</StatusBadge> : null}
    </span>
  );
}
