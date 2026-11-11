import type { ChallengeProgress } from "./mastery";

export type ConceptProgressLike = {
  totalAttempts: number;
  introducedAt: Date | null;
  nextReviewAt: Date | null;
  masteredAt: Date | null;
} | null;

export type ConceptStatus = "NEW" | "IN_PROGRESS" | "CLEARED";

export function conceptState(progress: ConceptProgressLike, now = new Date(), cleared = false) {
  const started = Boolean(progress?.introducedAt) || (progress?.totalAttempts ?? 0) > 0;
  const status: ConceptStatus = cleared ? "CLEARED" : started ? "IN_PROGRESS" : "NEW";
  return {
    status,
    started,
    reviewDue: Boolean(progress?.nextReviewAt && progress.nextReviewAt <= now),
  };
}

export type ConceptClear = ChallengeProgress;
