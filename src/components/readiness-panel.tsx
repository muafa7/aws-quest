import Link from "next/link";
import { ArcadeIcon } from "./arcade-icon";
import { buttonClassName } from "./arcade-button";
import { ProgressBar, percentOf } from "./progress-bar";
import { domainTone, Eyebrow, RetroPanel, StatusBadge } from "./retro-panel";
import type { CertificationReadiness } from "@/lib/learning/analytics";
import { READINESS_RULES, type Gate, type ReadinessState, type Sample } from "@/lib/learning/readiness";

const stateCopy: Record<ReadinessState, { title: string; badge: string; tone: "neutral" | "warning" | "success" }> = {
  INSUFFICIENT_DATA: { title: "Not enough evidence yet", badge: "Insufficient data", tone: "neutral" },
  NEEDS_REVIEW: { title: "The evidence shows gaps", badge: "Needs review", tone: "warning" },
  ON_TRACK: { title: "On track by internal benchmarks", badge: "On track", tone: "success" },
};

const missingCopy: Record<Gate["id"], string> = {
  "standard-mocks": "two recent full mocks",
  "mock-scores": "stable mock scores",
  fresh: "fresh evidence",
  domains: "enough answers in every domain",
  backlog: "a manageable review backlog",
};

const gateStatusText = { PASS: "Passes", FAIL: "Below target", MISSING: "Not enough data" } as const;
const pct = (value: number) => `${Math.round(value * 100)}%`;

function rate(sample: Sample) {
  return sample.total === 0 ? "\u2014" : `${Math.round((sample.correct / sample.total) * 100)}%`;
}

function summary(data: CertificationReadiness) {
  const { readiness } = data;
  if (!data.hasActivity) return "No answers recorded yet. Readiness is measured from full mock results once there are some to measure.";
  if (!data.bankSupportsFullMock) return `The training bank has ${data.trainingCount} of the ${data.examQuestionCount} questions a full mock needs, so readiness cannot be measured yet.`;
  if (readiness.state === "INSUFFICIENT_DATA") {
    const missing = readiness.gates.filter((gate) => gate.status === "MISSING");
    const shown = missing.some((gate) => gate.id === "standard-mocks") ? missing.filter((gate) => gate.id !== "mock-scores") : missing;
    return `Still missing: ${shown.map((gate) => missingCopy[gate.id]).join(", ")}.`;
  }
  if (readiness.state === "NEEDS_REVIEW") {
    const failing = readiness.gates.filter((gate) => gate.status === "FAIL").length;
    return `${failing} of ${readiness.gates.length} benchmarks ${failing === 1 ? "is" : "are"} below target.`;
  }
  return `All ${readiness.gates.length} internal benchmarks pass.`;
}

export function ReadinessPanelLoading() {
  return (
    <RetroPanel tone="violet" className="readiness-panel">
      <Eyebrow>EXAM READINESS{" // "}INTERNAL STUDY SIGNAL</Eyebrow>
      <p className="readiness-panel__summary" role="status">Calculating readiness from your mock and practice history&hellip;</p>
    </RetroPanel>
  );
}

export function ReadinessPanel({ code, data }: { code: string; data: CertificationReadiness }) {
  const { readiness, nextStep, evidence } = data;
  const copy = stateCopy[readiness.state];
  const evidenceItems = [
    { label: "First-time, from memory", sample: evidence.practiceFirst, detail: "Practice answers on questions never seen before" },
    { label: "First-time, guided", sample: evidence.learnFirst, detail: "Learn answers with the lesson available" },
    { label: "Repeat answers", sample: evidence.repeat, detail: "Questions answered or shown before" },
    { label: "First-sight in mocks", sample: readiness.firstSight, detail: `Unseen-at-start questions in qualifying standard mocks, last ${READINESS_RULES.windowDays} days` },
  ];

  return (
    <RetroPanel tone="violet" accent className="readiness-panel">
      <div className="readiness-panel__top">
        <div>
          <Eyebrow>EXAM READINESS{" // "}INTERNAL STUDY SIGNAL</Eyebrow>
          <h2>{copy.title}</h2>
        </div>
        <StatusBadge tone={copy.tone}>{copy.badge}</StatusBadge>
      </div>
      <p className="readiness-panel__summary">{summary(data)} This is a study indicator, not an AWS score or a pass prediction.</p>

      <div className="readiness-next">
        <div>
          <Eyebrow>NEXT STEP</Eyebrow>
          <p className="readiness-next__reason">{nextStep.reason}</p>
        </div>
        <Link href={nextStep.href} className={buttonClassName("primary")}>{nextStep.label} <ArcadeIcon name="arrow" width={18} height={18} /></Link>
      </div>

      <div className="readiness-grid">
        <section>
          <h3 className="readiness-panel__heading">Benchmarks</h3>
          <ul className="readiness-gates">
            {readiness.gates.map((gate) => (
              <li key={gate.id} className="readiness-gate" data-status={gate.status}>
                <span className="readiness-gate__mark" aria-hidden="true">{gate.status === "PASS" ? <ArcadeIcon name="check" width={16} height={16} /> : gate.status === "FAIL" ? <ArcadeIcon name="close" width={16} height={16} /> : "\u2014"}</span>
                <div>
                  <p>{gate.label}<span className="sr-only">: {gateStatusText[gate.status]}</span></p>
                  <small>{gate.detail}</small>
                </div>
              </li>
            ))}
          </ul>
          {readiness.excludedMocks > 0 ? <p className="panel-meta mt-3">{readiness.excludedMocks} recent mock{readiness.excludedMocks === 1 ? " was" : "s were"} left out: partial, submitted late, from before timing was recorded, or a fresh pack that was not fully unseen.</p> : null}
        </section>
        <section>
          <h3 className="readiness-panel__heading">Domains in recent mocks</h3>
          {readiness.domains.map((domain, index) => (
            <div key={domain.topicId} className="domain-result" data-tone={domainTone(index)}>
              <div className="domain-result__label">
                <span>{domain.name}</span>
                {!domain.enough ? <StatusBadge>Low sample</StatusBadge> : domain.passes ? <StatusBadge tone="success">On target</StatusBadge> : <StatusBadge tone="warning">Below {pct(READINESS_RULES.minDomainAccuracy)}</StatusBadge>}
              </div>
              <ProgressBar compact tone={domainTone(index)} value={percentOf(domain.correct, domain.total)} label={domain.name} valueText={domain.total === 0 ? "\u2014 \u00b7 no answers" : `${rate(domain)} of ${domain.total}`} />
            </div>
          ))}
        </section>
      </div>

      <h3 className="readiness-panel__heading mt-8">First-time vs repeat answers</h3>
      <dl className="evidence-grid">
        {evidenceItems.map((item) => (
          <div key={item.label} className="evidence-stat">
            <dt>{item.label}</dt>
            <dd>{rate(item.sample)}</dd>
            <p>{item.sample.total} answer{item.sample.total === 1 ? "" : "s"} · {item.detail}</p>
          </div>
        ))}
      </dl>
      <p className="panel-meta mt-3">
        {data.unseenCount} of {data.trainingCount} training questions have never been answered or shown in a mock.
        {evidence.untracked > 0 ? ` ${evidence.untracked} older answer${evidence.untracked === 1 ? "" : "s"} predate first-time tracking and are not counted above.` : ""}
        {" "}A dash means no answers yet, not 0%. &ldquo;Unseen&rdquo; only covers answers recorded in AWS Quest.
      </p>

      {data.misconceptions.length > 0 ? (
        <>
          <h3 className="readiness-panel__heading mt-8">Confident misses, last {READINESS_RULES.windowDays} days</h3>
          <div>
            {data.misconceptions.map(({ concept, count }) => (
              <div key={concept.id} className="log-row">
                <div className="log-row__top">
                  <Link href={`/learn/${code}/${concept.slug}`} className="hover:text-[var(--amber)]">{concept.name}</Link>
                  <span className="text-[var(--danger)]">{count} HIGH-confidence miss{count === 1 ? "" : "es"}</span>
                </div>
              </div>
            ))}
          </div>
          <Link href={`/mistakes?certification=${code}&confident=1`} className="text-link">All confident misses <ArcadeIcon name="arrow" width={16} height={16} /></Link>
        </>
      ) : null}

      <details className="feedback-details">
        <summary>How this is calculated</summary>
        <ul className="readiness-method">
          <li>Study heuristics v{READINESS_RULES.version}. These are practice targets chosen for AWS Quest, not AWS rules or passing scores.</li>
          <li>Only completed mocks with all {data.examQuestionCount} questions that were submitted within the time limit count. Partial, late, and older untimed runs stay in History but are left out here.</li>
          <li>Mock scores: the latest {READINESS_RULES.minStandardMocks} qualifying standard mocks from the last {READINESS_RULES.windowDays} days must average {pct(READINESS_RULES.minAverage)} or more, with neither below {pct(READINESS_RULES.minLowest)}. Blank answers count as wrong.</li>
          <li>Fresh evidence: a sealed fresh exam from the last {READINESS_RULES.freshWindowDays} days whose questions were all unseen at the start, or, without one, at least {READINESS_RULES.minFirstSightSample} first-sight answers in standard mocks. Either needs {pct(READINESS_RULES.minFreshScore)} or more. High mock scores on repeated questions alone never count as on track.</li>
          <li>Domains: at least {READINESS_RULES.minDomainSample} answers per domain across qualifying mocks from the last {READINESS_RULES.windowDays} days, at {pct(READINESS_RULES.minDomainAccuracy)} or more.</li>
          <li>Review backlog: no more than {pct(READINESS_RULES.maxDueFraction)} of started concepts due for review.</li>
          <li>Until every benchmark has enough data, the state stays Insufficient data.</li>
        </ul>
      </details>
    </RetroPanel>
  );
}
