import assert from "node:assert/strict";
import test from "node:test";
import { clearProgress, meetsMastery, type MasteryAttempt } from "../../src/lib/learning/mastery";
import { conceptClear, conceptState } from "../../src/lib/learning/status";

const day = (n: number, hour = 9) => new Date(Date.UTC(2026, 10, n, hour));
const attempt = (questionId: number, answeredAt: Date, overrides: Partial<MasteryAttempt> = {}): MasteryAttempt => ({
  questionId,
  isCorrect: true,
  confidence: "HIGH",
  answeredAt,
  ...overrides,
});

test("three correct, confident answers on different questions across two days clear a concept", () => {
  assert.ok(meetsMastery([attempt(1, day(10)), attempt(2, day(10, 10)), attempt(3, day(11))]));
});

test("repeating the same question cannot clear a concept", () => {
  assert.ok(!meetsMastery([attempt(1, day(10)), attempt(1, day(11)), attempt(2, day(12))]));
});

test("a single sitting cannot clear a concept", () => {
  assert.ok(!meetsMastery([attempt(1, day(10, 9)), attempt(2, day(10, 10)), attempt(3, day(10, 11))]));
});

test("a low-confidence or wrong answer in the latest three blocks clearing", () => {
  assert.ok(!meetsMastery([attempt(1, day(10)), attempt(2, day(11), { confidence: "LOW" }), attempt(3, day(12))]));
  assert.ok(!meetsMastery([attempt(1, day(10)), attempt(2, day(11), { isCorrect: false }), attempt(3, day(12))]));
});

test("only the latest three answers count, so a recovered streak clears again", () => {
  assert.ok(meetsMastery([attempt(9, day(8), { isCorrect: false }), attempt(1, day(10)), attempt(2, day(11)), attempt(3, day(12))]));
});

test("fewer than three answers never clear", () => {
  assert.ok(!meetsMastery([attempt(1, day(10)), attempt(2, day(11))]));
});

const now = day(15);

test("concept state separates status, due reviews, and small banks", () => {
  assert.deepEqual(conceptState(null, 5, now), { status: "NEW", started: false, reviewDue: false, smallBank: false });
  const progress = { totalAttempts: 2, introducedAt: day(10), nextReviewAt: day(14), masteredAt: null };
  assert.deepEqual(conceptState(progress, 2, now), { status: "IN_PROGRESS", started: true, reviewDue: true, smallBank: true });
  const cleared = { ...progress, masteredAt: day(13), nextReviewAt: day(20) };
  assert.equal(conceptState(cleared, 6, now).status, "CLEARED");
  assert.equal(conceptState(cleared, 6, now).reviewDue, false);
});

test("a concept answered only in Practice still counts as started", () => {
  const progress = { totalAttempts: 1, introducedAt: null, nextReviewAt: null, masteredAt: null };
  assert.equal(conceptState(progress, 4, now).status, "IN_PROGRESS");
});

test("clear progress counts the latest qualifying answers on different questions", () => {
  assert.deepEqual(clearProgress([], now), { counted: 0, remaining: 3, notBefore: null });
  assert.deepEqual(clearProgress([attempt(1, day(10)), attempt(2, day(11))], now), { counted: 2, remaining: 1, notBefore: null });
  assert.equal(clearProgress([attempt(1, day(10)), attempt(2, day(11)), attempt(1, day(12))], now).counted, 2);
});

test("a miss or a low-confidence answer resets clear progress", () => {
  assert.equal(clearProgress([attempt(1, day(10)), attempt(2, day(11), { isCorrect: false })], now).counted, 0);
  assert.equal(clearProgress([attempt(1, day(10)), attempt(2, day(11), { confidence: "LOW" })], now).counted, 0);
  assert.equal(clearProgress([attempt(9, day(10), { isCorrect: false }), attempt(1, day(11))], now).counted, 1);
});

test("the last answer waits for the next UTC day when the others were all today", () => {
  const sitting = [attempt(1, day(15, 8)), attempt(2, day(15, 9))];
  assert.deepEqual(clearProgress(sitting, day(15, 10)), { counted: 2, remaining: 1, notBefore: day(16, 0) });
  assert.equal(clearProgress(sitting, day(16, 1)).notBefore, null);
});

test("a full window that has not cleared still needs one more answer", () => {
  const oneSitting = [attempt(1, day(15, 8)), attempt(2, day(15, 9)), attempt(3, day(15, 10))];
  assert.ok(!meetsMastery(oneSitting));
  assert.deepEqual(clearProgress(oneSitting, day(15, 11)), { counted: 2, remaining: 1, notBefore: day(16, 0) });
  const resetByLearnMiss = [attempt(1, day(10)), attempt(2, day(11)), attempt(3, day(12))];
  assert.deepEqual(clearProgress(resetByLearnMiss, now), { counted: 2, remaining: 1, notBefore: null });
});

test("a stored clear wins over the current Practice streak", () => {
  const cleared = { totalAttempts: 4, introducedAt: day(9), nextReviewAt: day(20), masteredAt: day(12) };
  assert.deepEqual(conceptClear(cleared, [attempt(1, day(13), { confidence: "LOW" })], now), { cleared: true, practiced: true, counted: 3, remaining: 0, notBefore: null });
  const learnOnly = { ...cleared, masteredAt: null };
  assert.deepEqual(conceptClear(learnOnly, [], now), { cleared: false, practiced: false, counted: 0, remaining: 3, notBefore: null });
});
