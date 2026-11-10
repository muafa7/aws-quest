import assert from "node:assert/strict";
import test from "node:test";
import { confidencePriority, nextReviewStage, reviewDateForStage, scheduleReview } from "../../src/lib/learning/review";

const now = new Date("2026-11-11T09:00:00.000Z");
const inDays = (days: number) => new Date(now.getTime() + days * 86_400_000);

test("a correct answer before the review is due keeps the stage and the due date", () => {
  const due = inDays(3);
  assert.deepEqual(scheduleReview(1, true, "HIGH", now, due), { stage: 1, nextReviewAt: due });
});

test("repeated early correct answers cannot inflate the review stage", () => {
  let state = scheduleReview(0, true, "HIGH", now, null);
  for (let i = 0; i < 5; i++) state = scheduleReview(state.stage, true, "HIGH", now, state.nextReviewAt);
  assert.equal(state.stage, 1);
  assert.equal(state.nextReviewAt.toISOString(), reviewDateForStage(1, now).toISOString());
});

test("a correct answer on or after the due date advances normally", () => {
  const result = scheduleReview(2, true, "MEDIUM", now, inDays(-1));
  assert.equal(result.stage, 3);
  assert.equal(result.nextReviewAt.toISOString(), reviewDateForStage(3, now).toISOString());
});

test("a wrong answer lowers the stage and never postpones a pending review", () => {
  const due = inDays(2);
  const result = scheduleReview(5, false, "LOW", now, due);
  assert.equal(result.stage, 4);
  assert.equal(result.nextReviewAt.toISOString(), due.toISOString());
});

test("a wrong answer can pull a distant review closer", () => {
  const result = scheduleReview(4, false, "HIGH", now, inDays(30));
  assert.equal(result.stage, 0);
  assert.equal(result.nextReviewAt.toISOString(), reviewDateForStage(0, now).toISOString());
});

test("first answers schedule from the current stage", () => {
  assert.equal(scheduleReview(0, true, "LOW", now, null).stage, 0);
  assert.equal(scheduleReview(0, false, "HIGH", now, null).nextReviewAt.toISOString(), inDays(1).toISOString());
});

test("strong correct answers advance the review stage", () => {
  assert.equal(nextReviewStage(2, true, "HIGH"), 3);
  assert.equal(nextReviewStage(2, true, "MEDIUM"), 3);
});

test("low-confidence correct answers do not advance the review stage", () => {
  assert.equal(nextReviewStage(2, true, "LOW"), 2);
});

test("wrong answers lower the review stage based on confidence", () => {
  assert.equal(nextReviewStage(4, false, "HIGH"), 0);
  assert.equal(nextReviewStage(4, false, "MEDIUM"), 2);
  assert.equal(nextReviewStage(4, false, "LOW"), 3);
});

test("wrong plus high confidence has the highest misconception priority", () => {
  assert.equal(confidencePriority(false, "HIGH"), 10);
  assert.equal(confidencePriority(false, "MEDIUM"), 8);
  assert.equal(confidencePriority(false, "LOW"), 6);
  assert.equal(confidencePriority(true, "LOW"), 5);
});

test("review dates use the MVP 1/3/7/14/30/60 day schedule", () => {
  const from = new Date("2026-10-07T00:00:00.000Z");
  assert.equal(reviewDateForStage(0, from).toISOString(), "2026-10-08T00:00:00.000Z");
  assert.equal(reviewDateForStage(5, from).toISOString(), "2026-12-06T00:00:00.000Z");
});
