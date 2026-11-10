/**
 * Internal study heuristics, not AWS rules or pass thresholds. Kept in one versioned
 * object so the UI can show exactly what is measured.
 */
export const READINESS_RULES = {
  version: "1.0",
  windowDays: 30,
  freshWindowDays: 90,
  minStandardMocks: 2,
  minAverage: 0.8,
  minLowest: 0.75,
  minFreshScore: 0.75,
  minFirstSightSample: 65,
  minDomainSample: 10,
  minDomainAccuracy: 0.65,
  maxDueFraction: 0.2,
  minMisconceptions: 3,
} as const;

const DAY = 86_400_000;

export type ReadinessMock = {
  id: number;
  mode: string;
  packId: string | null;
  correct: number;
  total: number;
  full: boolean;
  /** timeValidity === "VALID"; late and unknown (historic) runs never count. */
  onTime: boolean;
  endedAt: Date;
  items: { topicId: number; isCorrect: boolean; wasUnseenAtStart: boolean | null }[];
};

export type ReadinessDomain = { topicId: number; name: string; slug: string };

export type ReadinessInput = {
  mocks: readonly ReadinessMock[];
  domains: readonly ReadinessDomain[];
  introduced: number;
  due: number;
  freshPackAvailable: boolean;
  bankSupportsFullMock: boolean;
  now: Date;
};

export type GateStatus = "PASS" | "FAIL" | "MISSING";
export type Gate = { id: "standard-mocks" | "mock-scores" | "fresh" | "domains" | "backlog"; label: string; status: GateStatus; detail: string };
export type DomainResult = ReadinessDomain & { correct: number; total: number; accuracy: number | null; enough: boolean; passes: boolean };
export type ReadinessState = "INSUFFICIENT_DATA" | "NEEDS_REVIEW" | "ON_TRACK";

export type Readiness = {
  state: ReadinessState;
  gates: Gate[];
  domains: DomainResult[];
  standardScores: number[];
  excludedMocks: number;
  firstSight: { correct: number; total: number };
  fresh: { score: number; packId: string | null; endedAt: Date } | null;
};

const pct = (value: number) => `${Math.round(value * 100)}%`;
const within = (date: Date, now: Date, days: number) => date <= now && now.getTime() - date.getTime() <= days * DAY;

/** A sealed run is fresh evidence only if every question was unseen when it started. */
function isSealedFirstSight(mock: ReadinessMock) {
  return mock.mode === "FRESH" && mock.items.length > 0 && mock.items.every((item) => item.wasUnseenAtStart === true);
}

export function calculateReadiness(input: ReadinessInput): Readiness {
  const { now } = input;
  const completed = input.mocks.filter((mock) => within(mock.endedAt, now, READINESS_RULES.windowDays));
  const eligible = completed.filter((mock) => mock.full && mock.onTime && (mock.mode !== "FRESH" || isSealedFirstSight(mock)));
  const standard = eligible.filter((mock) => mock.mode !== "FRESH").sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime());
  const latest = standard.slice(0, READINESS_RULES.minStandardMocks);
  const standardScores = latest.map((mock) => mock.correct / mock.total);

  const freshRun = input.mocks
    .filter((mock) => mock.full && mock.onTime && isSealedFirstSight(mock) && within(mock.endedAt, now, READINESS_RULES.freshWindowDays))
    .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime())[0];
  const fresh = freshRun ? { score: freshRun.correct / freshRun.total, packId: freshRun.packId, endedAt: freshRun.endedAt } : null;
  const firstSightItems = standard.flatMap((mock) => mock.items.filter((item) => item.wasUnseenAtStart === true));
  const firstSight = { correct: firstSightItems.filter((item) => item.isCorrect).length, total: firstSightItems.length };

  const domains: DomainResult[] = input.domains.map((domain) => {
    const items = eligible.flatMap((mock) => mock.items.filter((item) => item.topicId === domain.topicId));
    const correct = items.filter((item) => item.isCorrect).length;
    const accuracy = items.length > 0 ? correct / items.length : null;
    const enough = items.length >= READINESS_RULES.minDomainSample;
    return { ...domain, correct, total: items.length, accuracy, enough, passes: enough && accuracy !== null && accuracy >= READINESS_RULES.minDomainAccuracy };
  });

  const gates: Gate[] = [];
  gates.push({
    id: "standard-mocks",
    label: `${READINESS_RULES.minStandardMocks} full standard mocks, submitted on time, in the last ${READINESS_RULES.windowDays} days`,
    status: standard.length >= READINESS_RULES.minStandardMocks ? "PASS" : "MISSING",
    detail: input.bankSupportsFullMock ? `${Math.min(standard.length, READINESS_RULES.minStandardMocks)} of ${READINESS_RULES.minStandardMocks}` : "The training bank is too small for a full-length mock",
  });

  const average = standardScores.length === READINESS_RULES.minStandardMocks ? standardScores.reduce((a, b) => a + b, 0) / standardScores.length : null;
  const lowest = standardScores.length === READINESS_RULES.minStandardMocks ? Math.min(...standardScores) : null;
  gates.push({
    id: "mock-scores",
    label: `Latest two average ${pct(READINESS_RULES.minAverage)} or more, neither below ${pct(READINESS_RULES.minLowest)}`,
    status: average === null || lowest === null ? "MISSING" : average >= READINESS_RULES.minAverage && lowest >= READINESS_RULES.minLowest ? "PASS" : "FAIL",
    detail: average === null || lowest === null ? "Needs two qualifying mocks" : `Average ${pct(average)}, lowest ${pct(lowest)}`,
  });

  const freshLabel = `Fresh evidence at ${pct(READINESS_RULES.minFreshScore)} or more: a sealed exam, or ${READINESS_RULES.minFirstSightSample}+ first-sight mock answers`;
  if (fresh) {
    gates.push({ id: "fresh", label: freshLabel, status: fresh.score >= READINESS_RULES.minFreshScore ? "PASS" : "FAIL", detail: `Sealed exam${fresh.packId ? ` ${fresh.packId}` : ""}: ${pct(fresh.score)}` });
  } else if (firstSight.total >= READINESS_RULES.minFirstSightSample) {
    const score = firstSight.correct / firstSight.total;
    gates.push({ id: "fresh", label: freshLabel, status: score >= READINESS_RULES.minFreshScore ? "PASS" : "FAIL", detail: `First-sight mock answers: ${pct(score)} across ${firstSight.total}` });
  } else {
    gates.push({
      id: "fresh",
      label: freshLabel,
      status: "MISSING",
      detail: input.freshPackAvailable ? `No sealed exam yet; ${firstSight.total} of ${READINESS_RULES.minFirstSightSample} first-sight answers` : `No sealed pack available; ${firstSight.total} of ${READINESS_RULES.minFirstSightSample} first-sight answers`,
    });
  }

  const thin = domains.filter((domain) => !domain.enough);
  const weak = domains.filter((domain) => domain.enough && !domain.passes);
  gates.push({
    id: "domains",
    label: `Every domain: ${READINESS_RULES.minDomainSample}+ recent mock answers at ${pct(READINESS_RULES.minDomainAccuracy)} or more`,
    status: domains.length === 0 || thin.length > 0 ? "MISSING" : weak.length > 0 ? "FAIL" : "PASS",
    detail: domains.length === 0 ? "No domains configured" : thin.length > 0 ? `Too few answers: ${thin.map((domain) => domain.name).join(", ")}` : weak.length > 0 ? `Below target: ${weak.map((domain) => `${domain.name} ${pct(domain.accuracy ?? 0)}`).join(", ")}` : "All domains on target",
  });

  const dueFraction = input.introduced > 0 ? input.due / input.introduced : 0;
  gates.push({
    id: "backlog",
    label: `At most ${pct(READINESS_RULES.maxDueFraction)} of started concepts due for review`,
    status: dueFraction <= READINESS_RULES.maxDueFraction ? "PASS" : "FAIL",
    detail: input.introduced > 0 ? `${input.due} of ${input.introduced} due` : "No concepts started yet",
  });

  const state: ReadinessState = !input.bankSupportsFullMock || gates.some((gate) => gate.status === "MISSING")
    ? "INSUFFICIENT_DATA"
    : gates.some((gate) => gate.status === "FAIL") ? "NEEDS_REVIEW" : "ON_TRACK";

  return { state, gates, domains, standardScores, excludedMocks: completed.length - eligible.length, firstSight, fresh };
}

export type Sample = { correct: number; total: number };
export type AttemptGroup = { mode: string; isFirstRecordedAttempt: boolean | null; isCorrect: boolean; count: number };

/**
 * Splits answers by whether the question was new to the learner. Learn answers are made
 * with the lesson open, so first-time Learn and Practice answers are reported separately.
 * Attempts recorded before tracking began (null) are counted but never guessed.
 */
export function answerEvidence(groups: readonly AttemptGroup[]) {
  const sample = (match: (group: AttemptGroup) => boolean): Sample => {
    const matching = groups.filter(match);
    return {
      correct: matching.filter((group) => group.isCorrect).reduce((sum, group) => sum + group.count, 0),
      total: matching.reduce((sum, group) => sum + group.count, 0),
    };
  };
  return {
    practiceFirst: sample((group) => group.mode === "PRACTICE" && group.isFirstRecordedAttempt === true),
    learnFirst: sample((group) => group.mode === "LEARN" && group.isFirstRecordedAttempt === true),
    repeat: sample((group) => group.isFirstRecordedAttempt === false),
    untracked: sample((group) => group.isFirstRecordedAttempt === null).total,
  };
}

export function rankMisconceptions<T extends { id: number }>(concepts: readonly T[], limit = 5) {
  const counts = new Map<number, { concept: T; count: number }>();
  for (const concept of concepts) {
    const entry = counts.get(concept.id) ?? { concept, count: 0 };
    entry.count += 1;
    counts.set(concept.id, entry);
  }
  return [...counts.values()].sort((a, b) => b.count - a.count || a.concept.id - b.concept.id).slice(0, limit);
}

export type NextStep = { label: string; href: string; reason: string };

export function readinessNextStep(readiness: Readiness, context: {
  code: string;
  hasActivity: boolean;
  bankSupportsFullMock: boolean;
  freshPackAvailable: boolean;
  misconceptions: number;
}): NextStep {
  const { code } = context;
  const gate = (id: Gate["id"]) => readiness.gates.find((item) => item.id === id)?.status;
  const weakest = readiness.domains.filter((domain) => domain.enough && !domain.passes).sort((a, b) => (a.accuracy ?? 0) - (b.accuracy ?? 0))[0];

  if (!context.hasActivity) return { label: "Start the first lesson", href: `/learn/${code}`, reason: "Readiness needs real answers first. Work through lessons and Practice, then take a full mock." };
  if (!context.bankSupportsFullMock) return { label: "Keep practicing", href: `/practice/${code}`, reason: "The training bank cannot fill a full-length mock yet, so readiness cannot be measured." };
  if (gate("standard-mocks") !== "PASS") return { label: "Take a full mock", href: `/mock/${code}`, reason: "Readiness needs two recent full-length mocks submitted on time." };
  if (weakest) return { label: `Review ${weakest.name}`, href: `/mistakes?certification=${code}&domain=${weakest.slug}`, reason: `${weakest.name} is at ${pct(weakest.accuracy ?? 0)} across ${weakest.total} recent mock answers.` };
  if (context.misconceptions >= READINESS_RULES.minMisconceptions) return { label: "Review confident misses", href: `/mistakes?certification=${code}&confident=1`, reason: `${context.misconceptions} wrong answers given with HIGH confidence in the last ${READINESS_RULES.windowDays} days point to misconceptions.` };
  if (gate("mock-scores") === "FAIL") return { label: "Practice, then retake a mock", href: `/practice/${code}`, reason: "Recent mock scores are below the internal target." };
  if (gate("fresh") !== "PASS" && context.freshPackAvailable) return { label: "Take the sealed fresh exam", href: `/mock/${code}`, reason: "A one-time exam on never-seen questions shows whether results go beyond familiarity." };
  if (gate("fresh") === "MISSING") return { label: "Take another standard mock", href: `/mock/${code}`, reason: "Mocks use questions you have not answered first, which builds a first-sight sample." };
  if (gate("fresh") === "FAIL") return { label: "Practice from memory", href: `/practice/${code}`, reason: "First-sight accuracy is below target, so repeated questions may be inflating scores." };
  if (gate("domains") === "MISSING") return { label: "Take another full mock", href: `/mock/${code}`, reason: "Some domains have too few recent mock answers to judge." };
  if (gate("backlog") === "FAIL") return { label: "Clear due reviews", href: `/practice/${code}`, reason: "Too many started concepts are due for review." };
  return { label: "Keep the review schedule", href: `/practice/${code}`, reason: "Every internal benchmark passes. Confirm with official AWS practice material before booking the exam." };
}
