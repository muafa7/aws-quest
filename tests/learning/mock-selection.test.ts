import assert from "node:assert/strict";
import test from "node:test";
import { buildMockSelection, examDeadline, isWithinTime, packStatus, type ExposureTier } from "../../src/lib/learning/mock-selection";

function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const pool = (topicId: number, weight: number, size: number) => ({
  topicId,
  weight,
  questions: Array.from({ length: size }, (_, index) => ({ id: topicId * 1000 + index })),
});

const saa = [pool(1, 0.3, 90), pool(2, 0.26, 70), pool(3, 0.24, 60), pool(4, 0.2, 50)];

test("a standard mock follows the domain blueprint with no repeated question", () => {
  const picked = buildMockSelection(saa, 65, undefined, seeded(1));
  assert.equal(picked.length, 65);
  assert.equal(new Set(picked.map((item) => item.question.id)).size, 65);
  assert.deepEqual([1, 2, 3, 4].map((topicId) => picked.filter((item) => item.topicId === topicId).length), [19, 17, 16, 13]);
});

test("consecutive mocks differ in questions and in order", () => {
  const first = buildMockSelection(saa, 65, undefined, seeded(1)).map((item) => item.question.id);
  const second = buildMockSelection(saa, 65, undefined, seeded(2)).map((item) => item.question.id);
  assert.notDeepEqual(new Set(first), new Set(second));
  assert.notDeepEqual(first, second);
});

test("questions are not grouped by domain in the final order", () => {
  const topics = buildMockSelection(saa, 65, undefined, seeded(3)).map((item) => item.topicId);
  const runs = topics.filter((topic, index) => index > 0 && topic !== topics[index - 1]).length;
  assert.ok(runs > 10, `expected domains to interleave, got ${runs} changes`);
});

test("unseen questions are used before familiar ones, and mock repeats come last", () => {
  const questions = pool(1, 1, 10);
  const tiers = new Map<number, ExposureTier>([[1000, 0], [1001, 0], [1002, 1], [1003, 1], [1004, 1]]);
  const exposure = (id: number): ExposureTier => tiers.get(id) ?? 2;
  const picked = buildMockSelection([questions], 4, exposure, seeded(4)).map((item) => item.question.id).sort();
  assert.deepEqual(picked.slice(0, 2), [1000, 1001]);
  assert.ok(picked.slice(2).every((id) => tiers.get(id) === 1));
});

test("a small domain gives its unfilled seats to the others", () => {
  const picked = buildMockSelection([pool(1, 0.5, 3), pool(2, 0.5, 100)], 20, undefined, seeded(5));
  assert.equal(picked.length, 20);
  assert.equal(picked.filter((item) => item.topicId === 1).length, 3);
});

test("a bank smaller than the exam yields a partial mock with every question", () => {
  assert.equal(buildMockSelection([pool(1, 0.6, 5), pool(2, 0.4, 4)], 65, undefined, seeded(6)).length, 9);
  assert.deepEqual(buildMockSelection([pool(1, 1, 0)], 65), []);
});

test("submit time is checked against the deadline with a short grace", () => {
  const startedAt = new Date("2026-11-11T09:00:00.000Z");
  assert.equal(examDeadline(startedAt, 130).toISOString(), "2026-11-11T11:10:00.000Z");
  assert.ok(isWithinTime(startedAt, 130, new Date("2026-11-11T11:10:00.000Z")));
  assert.ok(isWithinTime(startedAt, 130, new Date("2026-11-11T11:10:29.000Z")));
  assert.ok(!isWithinTime(startedAt, 130, new Date("2026-11-11T11:10:31.000Z")));
});

test("a sealed pack is fresh only when complete, unused, and never shown", () => {
  assert.deepEqual(packStatus({ size: 65, examLength: 65, exposed: 0, usedByExamId: null }), { state: "AVAILABLE" });
  assert.deepEqual(packStatus({ size: 65, examLength: 65, exposed: 0, usedByExamId: 12 }), { state: "USED", examId: 12 });
  assert.deepEqual(packStatus({ size: 65, examLength: 65, exposed: 2, usedByExamId: null }), { state: "EXPOSED", exposed: 2 });
  assert.deepEqual(packStatus({ size: 60, examLength: 65, exposed: 0, usedByExamId: null }), { state: "INCOMPLETE", size: 60 });
});
