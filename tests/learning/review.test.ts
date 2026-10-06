import assert from "node:assert/strict";
import test from "node:test";
import { confidencePriority, nextReviewStage, reviewDateForStage } from "../../src/lib/learning/review";

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
