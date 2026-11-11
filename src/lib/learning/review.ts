import type { Confidence } from "./types";

export const REVIEW_INTERVAL_DAYS = [1, 3, 7, 14, 30, 60] as const;

export function nextReviewStage(currentStage: number, isCorrect: boolean, confidence: Confidence) {
  const safeStage = Math.max(0, Math.min(currentStage, REVIEW_INTERVAL_DAYS.length - 1));

  if (!isCorrect) {
    if (confidence === "HIGH") return 0;
    if (confidence === "MEDIUM") return Math.max(0, safeStage - 2);
    return Math.max(0, safeStage - 1);
  }

  if (confidence === "LOW") return safeStage;
  return Math.min(REVIEW_INTERVAL_DAYS.length - 1, safeStage + 1);
}

export function reviewDateForStage(stage: number, from = new Date()) {
  const safeStage = Math.max(0, Math.min(stage, REVIEW_INTERVAL_DAYS.length - 1));
  const next = new Date(from);
  next.setDate(next.getDate() + REVIEW_INTERVAL_DAYS[safeStage]);
  return next;
}

/**
 * Spaced review only advances when the concept is actually due. Answering again before
 * the due date (for example several questions of one concept in the same session) can
 * reinforce recall but must not stretch the interval. A wrong answer always reschedules,
 * and never later than the review that was already pending.
 */
export function scheduleReview(stage: number, isCorrect: boolean, confidence: Confidence, now: Date, currentDue: Date | null) {
  const early = currentDue !== null && currentDue.getTime() > now.getTime();
  if (early && isCorrect) return { stage, nextReviewAt: currentDue };

  const nextStage = nextReviewStage(stage, isCorrect, confidence);
  const scheduled = reviewDateForStage(nextStage, now);
  const nextReviewAt = early && scheduled.getTime() > currentDue.getTime() ? currentDue : scheduled;
  return { stage: nextStage, nextReviewAt };
}

export function confidencePriority(isCorrect: boolean, confidence: Confidence) {
  if (!isCorrect && confidence === "HIGH") return 10;
  if (!isCorrect && confidence === "MEDIUM") return 8;
  if (!isCorrect && confidence === "LOW") return 6;
  if (isCorrect && confidence === "LOW") return 5;
  if (isCorrect && confidence === "MEDIUM") return 2;
  return 0;
}
