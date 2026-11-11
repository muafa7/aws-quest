import { MASTERY_WINDOW, clearProgress, type ClearProgress, type MasteryAttempt } from "./mastery";

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

export type ConceptClear = ClearProgress & { cleared: boolean; practiced: boolean };

/** The stored clear wins: it survives later answers that would not clear on their own. */
export function conceptClear(progress: ConceptProgressLike, practiceAttempts: readonly MasteryAttempt[], now = new Date()): ConceptClear {
  const practiced = practiceAttempts.length > 0;
  if (progress?.masteredAt) return { cleared: true, practiced, counted: MASTERY_WINDOW, remaining: 0, notBefore: null };
  return { cleared: false, practiced, ...clearProgress(practiceAttempts, now) };
}
