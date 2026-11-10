import assert from "node:assert/strict";
import test from "node:test";
import {
  answerEvidence,
  calculateReadiness,
  rankMisconceptions,
  readinessNextStep,
  type Gate,
  type Readiness,
  type ReadinessInput,
  type ReadinessMock,
} from "../../src/lib/learning/readiness";

const now = new Date("2026-11-11T12:00:00.000Z");
const domains = [1, 2, 3, 4].map((topicId) => ({ topicId, name: `Domain ${topicId}`, slug: `domain-${topicId}` }));

type MockOptions = {
  mode?: string;
  packId?: string;
  score?: number;
  daysAgo?: number;
  onTime?: boolean;
  size?: number;
  /** true/false/null for every item, or the number of leading items that were unseen */
  unseen?: boolean | null | number;
  missUnseen?: boolean;
  wrongTopic?: number;
};

function mock(id: number, options: MockOptions = {}): ReadinessMock {
  const size = options.size ?? 65;
  const target = Math.round((options.score ?? 0.85) * size);
  const items = Array.from({ length: size }, (_, index) => {
    const topicId = (index % 4) + 1;
    const unseen = options.unseen;
    const wasUnseenAtStart = typeof unseen === "number" ? index < unseen : unseen === undefined ? false : unseen;
    const isCorrect = options.wrongTopic ? topicId !== options.wrongTopic : options.missUnseen ? !wasUnseenAtStart : index < target;
    return { topicId, isCorrect, wasUnseenAtStart };
  });
  return {
    id,
    mode: options.mode ?? "STANDARD",
    packId: options.packId ?? null,
    correct: items.filter((item) => item.isCorrect).length,
    total: size,
    full: size === 65,
    onTime: options.onTime ?? true,
    endedAt: new Date(now.getTime() - (options.daysAgo ?? 1) * 86_400_000),
    items,
  };
}

const fresh = (id: number, score = 0.8, options: MockOptions = {}) => mock(id, { mode: "FRESH", packId: "SAA-C03-FRESH-A", unseen: true, score, ...options });
const input = (overrides: Partial<ReadinessInput> = {}): ReadinessInput => ({ mocks: [], domains, introduced: 40, due: 4, freshPackAvailable: false, bankSupportsFullMock: true, now, ...overrides });
const status = (result: Readiness, id: Gate["id"]) => result.gates.find((gate) => gate.id === id)?.status;
const next = (result: Readiness, overrides: Partial<Parameters<typeof readinessNextStep>[1]> = {}) =>
  readinessNextStep(result, { code: "CLF-C02", hasActivity: true, bankSupportsFullMock: true, freshPackAvailable: false, misconceptions: 0, ...overrides });

test("a brand-new learner gets insufficient data, no failing gates, and a first lesson", () => {
  const result = calculateReadiness(input({ introduced: 0, due: 0 }));
  assert.equal(result.state, "INSUFFICIENT_DATA");
  assert.ok(result.gates.every((gate) => gate.status !== "FAIL"));
  assert.ok(result.domains.every((domain) => domain.accuracy === null && domain.total === 0));
  const step = next(result, { hasActivity: false });
  assert.equal(step.label, "Start the first lesson");
  assert.equal(step.href, "/learn/CLF-C02");
});

test("one full mock never produces on track", () => {
  const result = calculateReadiness(input({ mocks: [mock(1, { score: 0.95 }), fresh(2, 0.95)] }));
  assert.equal(result.state, "INSUFFICIENT_DATA");
  assert.equal(status(result, "standard-mocks"), "MISSING");
  assert.equal(next(result).label, "Take a full mock");
});

test("strong repeated mocks without fresh evidence stay insufficient", () => {
  const result = calculateReadiness(input({ mocks: [mock(1, { score: 0.95 }), mock(2, { score: 0.95 })] }));
  assert.equal(status(result, "mock-scores"), "PASS");
  assert.equal(status(result, "fresh"), "MISSING");
  assert.equal(result.state, "INSUFFICIENT_DATA");
  assert.equal(next(result).label, "Take another standard mock");
  assert.equal(next(result, { freshPackAvailable: true }).label, "Take the sealed fresh exam");
});

test("stable mocks, a sealed fresh run, domain coverage and a small backlog are on track", () => {
  const result = calculateReadiness(input({ mocks: [mock(1, { score: 0.84 }), mock(2, { score: 0.82, daysAgo: 3 }), fresh(3, 0.8)] }));
  assert.equal(result.state, "ON_TRACK");
  assert.equal(result.gates.length, 5);
  assert.ok(result.gates.every((gate) => gate.status === "PASS"));
  assert.match(next(result).reason, /official AWS practice/);
});

test("enough first-sight answers in standard mocks can stand in for a sealed exam", () => {
  const enough = calculateReadiness(input({ mocks: [mock(1, { unseen: 40 }), mock(2, { unseen: 40 })] }));
  assert.equal(enough.firstSight.total, 80);
  assert.equal(status(enough, "fresh"), "PASS");
  assert.equal(enough.state, "ON_TRACK");

  const tooFew = calculateReadiness(input({ mocks: [mock(1, { unseen: 30 }), mock(2, { unseen: 30 })] }));
  assert.equal(status(tooFew, "fresh"), "MISSING");
  assert.equal(tooFew.state, "INSUFFICIENT_DATA");

  const weak = calculateReadiness(input({ mocks: [mock(1, { unseen: 40, missUnseen: true }), mock(2, { unseen: 40 })] }));
  assert.equal(status(weak, "fresh"), "FAIL");
  assert.equal(weak.state, "NEEDS_REVIEW");
});

test("late, untimed, partial and old mocks do not satisfy the mock gates", () => {
  const result = calculateReadiness(input({
    mocks: [mock(1, { onTime: false, score: 0.95 }), mock(2, { size: 20, score: 1 }), mock(3, { daysAgo: 45, score: 0.95 }), mock(4, { score: 0.95 }), fresh(5)],
  }));
  assert.equal(status(result, "standard-mocks"), "MISSING");
  assert.deepEqual(result.standardScores, [Math.round(0.95 * 65) / 65]);
  assert.equal(result.excludedMocks, 2);
});

test("a fresh run with previously seen questions is not fresh evidence", () => {
  const contaminated = fresh(3, 0.9, { unseen: 64 });
  const result = calculateReadiness(input({ mocks: [mock(1), mock(2), contaminated] }));
  assert.equal(result.fresh, null);
  assert.equal(status(result, "fresh"), "MISSING");
  assert.equal(result.excludedMocks, 1);
});

test("a sealed run counts as fresh evidence for 90 days, but not as recent domain data", () => {
  const result = calculateReadiness(input({ mocks: [mock(1), mock(2), fresh(3, 0.8, { daysAgo: 60 })] }));
  assert.equal(status(result, "fresh"), "PASS");
  assert.equal(result.domains[0]?.total, 34);
  assert.equal(calculateReadiness(input({ mocks: [mock(1), mock(2), fresh(3, 0.8, { daysAgo: 100 })] })).fresh, null);
});

test("a thin domain sample is missing data, and a weak domain needs review with a targeted step", () => {
  const thin = calculateReadiness(input({ mocks: [mock(1, { size: 20 }), mock(2, { size: 20 })] }));
  assert.equal(status(thin, "domains"), "MISSING");

  const weak = calculateReadiness(input({ mocks: [mock(1, { wrongTopic: 2 }), mock(2), fresh(3)] }));
  assert.equal(status(weak, "domains"), "FAIL");
  assert.equal(weak.state, "NEEDS_REVIEW");
  const step = next(weak);
  assert.equal(step.label, "Review Domain 2");
  assert.equal(step.href, "/mistakes?certification=CLF-C02&domain=domain-2");
});

test("low or unstable mock scores need review with the measured values shown", () => {
  const result = calculateReadiness(input({ mocks: [mock(1, { score: 0.74 }), mock(2, { score: 0.86 }), fresh(3)] }));
  assert.equal(status(result, "mock-scores"), "FAIL");
  assert.equal(result.state, "NEEDS_REVIEW");
  assert.match(result.gates.find((gate) => gate.id === "mock-scores")?.detail ?? "", /Average 80%, lowest 74%/);
});

test("the review backlog gate uses started concepts and passes when nothing has started", () => {
  const strong = [mock(1), mock(2), fresh(3)];
  assert.equal(calculateReadiness(input({ mocks: strong, introduced: 40, due: 9 })).state, "NEEDS_REVIEW");
  assert.equal(status(calculateReadiness(input({ mocks: strong, introduced: 40, due: 8 })), "backlog"), "PASS");
  assert.equal(status(calculateReadiness(input({ mocks: strong, introduced: 0, due: 0 })), "backlog"), "PASS");
});

test("confident misses are prioritised after weak domains", () => {
  const result = calculateReadiness(input({ mocks: [mock(1), mock(2), fresh(3)] }));
  assert.equal(next(result, { misconceptions: 3 }).label, "Review confident misses");
  assert.equal(next(result, { misconceptions: 2 }).label, "Keep the review schedule");
});

test("a bank too small for a full mock cannot be assessed", () => {
  const result = calculateReadiness(input({ bankSupportsFullMock: false }));
  assert.equal(result.state, "INSUFFICIENT_DATA");
  assert.match(result.gates[0]?.detail ?? "", /too small/);
  assert.equal(next(result, { bankSupportsFullMock: false }).label, "Keep practicing");
});

test("no copy claims an AWS pass or score", () => {
  const states = [input(), input({ mocks: [mock(1), mock(2), fresh(3)] }), input({ mocks: [mock(1, { score: 0.6 }), mock(2), fresh(3)] })];
  for (const state of states) {
    const result = calculateReadiness(state);
    const copy = [...result.gates.flatMap((gate) => [gate.label, gate.detail]), ...Object.values(next(result))].join(" ");
    assert.doesNotMatch(copy, /guarantee|will pass|chance of passing|certification ready|scaled score/i);
  }
});

test("answer evidence separates first-time Practice, guided Learn, repeats and untracked history", () => {
  const evidence = answerEvidence([
    { mode: "PRACTICE", isFirstRecordedAttempt: true, isCorrect: true, count: 6 },
    { mode: "PRACTICE", isFirstRecordedAttempt: true, isCorrect: false, count: 2 },
    { mode: "LEARN", isFirstRecordedAttempt: true, isCorrect: true, count: 9 },
    { mode: "LEARN", isFirstRecordedAttempt: false, isCorrect: true, count: 3 },
    { mode: "PRACTICE", isFirstRecordedAttempt: false, isCorrect: false, count: 1 },
    { mode: "PRACTICE", isFirstRecordedAttempt: null, isCorrect: true, count: 12 },
  ]);
  assert.deepEqual(evidence.practiceFirst, { correct: 6, total: 8 });
  assert.deepEqual(evidence.learnFirst, { correct: 9, total: 9 });
  assert.deepEqual(evidence.repeat, { correct: 3, total: 4 });
  assert.equal(evidence.untracked, 12);
  assert.deepEqual(answerEvidence([]).practiceFirst, { correct: 0, total: 0 });
});

test("misconceptions are ranked by count, then by concept", () => {
  const a = { id: 1, name: "A" };
  const b = { id: 2, name: "B" };
  const c = { id: 3, name: "C" };
  assert.deepEqual(rankMisconceptions([c, b, a, b, c, c], 2).map((entry) => [entry.concept.name, entry.count]), [["C", 3], ["B", 2]]);
});
