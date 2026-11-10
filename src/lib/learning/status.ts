import { MASTERY_WINDOW } from "./mastery";

export type ConceptProgressLike = {
  totalAttempts: number;
  introducedAt: Date | null;
  nextReviewAt: Date | null;
  masteredAt: Date | null;
} | null;

export type ConceptStatus = "NEW" | "IN_PROGRESS" | "CLEARED";

export function conceptState(progress: ConceptProgressLike, trainingQuestions: number, now = new Date()) {
  const started = Boolean(progress?.introducedAt) || (progress?.totalAttempts ?? 0) > 0;
  const status: ConceptStatus = progress?.masteredAt ? "CLEARED" : started ? "IN_PROGRESS" : "NEW";
  return {
    status,
    started,
    reviewDue: Boolean(progress?.nextReviewAt && progress.nextReviewAt <= now),
    // Mastery needs answers on three different questions; smaller banks cannot get there yet.
    smallBank: trainingQuestions < MASTERY_WINDOW,
  };
}
