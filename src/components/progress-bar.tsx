import type { PanelTone } from "./retro-panel";

export function percentOf(part: number, total: number) {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

export function ProgressBar({ value, label, valueText, detail, tone, compact = false }: {
  value: number;
  label?: string;
  /** Replaces the percent readout, e.g. "Lesson 12 of 90". Presentation only. */
  valueText?: string;
  detail?: string;
  tone?: PanelTone;
  compact?: boolean;
}) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={`progress-meter${compact ? " progress-meter--compact" : ""}`} data-tone={tone}>
      {label ? <div className="progress-meter__label"><span>{label}</span><strong>{valueText ?? <>{safe}<span>%</span></>}</strong></div> : null}
      <div className="progress-meter__track" role="progressbar" aria-label={label ?? "Progress"} aria-valuemin={0} aria-valuemax={100} aria-valuenow={safe} aria-valuetext={valueText ? `${label ?? "Progress"}: ${valueText}` : undefined}>
        <div className="progress-meter__fill" style={{ width: `${safe}%` }} />
      </div>
      {detail ? <p className="progress-meter__detail">{detail}</p> : null}
    </div>
  );
}

/**
 * Two readings of the same existing data: how many concepts the learner has started,
 * and how many meet the existing "cleared" (mastered) rule. No new metric or rule.
 */
export function CampaignMeters({ introduced, mastered, total, masteryLabel = "Concept mastery" }: {
  introduced: number;
  mastered: number;
  total: number;
  masteryLabel?: string;
}) {
  return (
    <div className="meter-stack">
      <ProgressBar tone="teal" value={percentOf(introduced, total)} label="Lessons started" detail={`${introduced} of ${total} concepts introduced`} />
      <ProgressBar value={percentOf(mastered, total)} label={masteryLabel} detail={`${mastered} of ${total} cleared`} />
    </div>
  );
}
