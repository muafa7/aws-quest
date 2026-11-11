import assert from "node:assert/strict";
import test from "node:test";
import { challengeProgress } from "../../src/lib/learning/mastery";
import { conceptState } from "../../src/lib/learning/status";

const day = (n: number, hour = 9) => new Date(Date.UTC(2026, 10, n, hour));

test("a stage clears once every challenge has been answered", () => {
  assert.deepEqual(challengeProgress([1, 2, 3], [1, 2, 3]), { done: 3, total: 3, remaining: 0, cleared: true });
  assert.deepEqual(challengeProgress([1, 2, 3], [1, 1, 2]), { done: 2, total: 3, remaining: 1, cleared: false });
});

test("repeating a challenge does not add progress, and a wrong answer still counts as answered", () => {
  assert.equal(challengeProgress([1, 2], [1, 1, 1]).done, 1);
  assert.equal(challengeProgress([1, 2], [1, 2]).cleared, true);
});

test("answers outside the stage do not count, and an empty stage cannot clear", () => {
  assert.deepEqual(challengeProgress([1], [9]), { done: 0, total: 1, remaining: 1, cleared: false });
  assert.deepEqual(challengeProgress([], []), { done: 0, total: 0, remaining: 0, cleared: false });
});

const now = day(15);

test("concept state separates status and due reviews", () => {
  assert.deepEqual(conceptState(null, now), { status: "NEW", started: false, reviewDue: false });
  const progress = { totalAttempts: 2, introducedAt: day(10), nextReviewAt: day(14), masteredAt: null };
  assert.deepEqual(conceptState(progress, now), { status: "IN_PROGRESS", started: true, reviewDue: true });
  assert.equal(conceptState(progress, now, true).status, "CLEARED");
  const cleared = { ...progress, masteredAt: day(13), nextReviewAt: day(20) };
  assert.equal(conceptState(cleared, now).status, "IN_PROGRESS");
  assert.equal(conceptState(cleared, now).reviewDue, false);
});

test("a concept answered only in Practice still counts as started", () => {
  const progress = { totalAttempts: 1, introducedAt: null, nextReviewAt: null, masteredAt: null };
  assert.equal(conceptState(progress, now).status, "IN_PROGRESS");
});
