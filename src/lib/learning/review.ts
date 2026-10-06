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

export function confidencePriority(isCorrect: boolean, confidence: Confidence) {
  if (!isCorrect && confidence === "HIGH") return 10;
  if (!isCorrect && confidence === "MEDIUM") return 8;
  if (!isCorrect && confidence === "LOW") return 6;
  if (isCorrect && confidence === "LOW") return 5;
  if (isCorrect && confidence === "MEDIUM") return 2;
  return 0;
}
