import { shuffled } from "./answers";
import { allocateQuotas } from "./blueprint";

export type TopicPool<T> = { topicId: number; weight: number; questions: readonly T[] };
export type SelectedMockItem<T> = { topicId: number; question: T };

/** 0 = never answered, 1 = answered in Learn or Practice only, 2 = already shown in a mock. */
export type ExposureTier = 0 | 1 | 2;

/**
 * Samples a mock by the domain blueprint (largest remainder, capped by what each
 * domain has). Within a domain the least exposed questions are taken first, in random
 * order, so consecutive mocks differ and lean on questions the learner has not seen.
 * The final question order is shuffled across domains.
 */
export function buildMockSelection<T extends { id: number }>(
  pools: readonly TopicPool<T>[],
  requestedCount: number,
  exposure: (questionId: number) => ExposureTier = () => 0,
  random: () => number = Math.random,
): SelectedMockItem<T>[] {
  const capacity = pools.reduce((sum, pool) => sum + pool.questions.length, 0);
  if (capacity === 0) return [];
  const quotas = allocateQuotas(pools.map((pool) => ({ weight: pool.weight, capacity: pool.questions.length })), Math.min(requestedCount, capacity));

  const picked = pools.flatMap((pool, index) => {
    const byTier: T[][] = [[], [], []];
    for (const question of shuffled(pool.questions, random)) byTier[exposure(question.id)].push(question);
    return byTier.flat().slice(0, quotas[index]).map((question) => ({ topicId: pool.topicId, question }));
  });
  return shuffled(picked, random);
}

export const SUBMIT_GRACE_SECONDS = 30;

export function examDeadline(startedAt: Date, durationMinutes: number) {
  return new Date(startedAt.getTime() + durationMinutes * 60_000);
}

/** Submissions within a short grace after the deadline still count, to absorb the auto-submit round trip. */
export function isWithinTime(startedAt: Date, durationMinutes: number, at: Date, graceSeconds = SUBMIT_GRACE_SECONDS) {
  return at.getTime() <= examDeadline(startedAt, durationMinutes).getTime() + graceSeconds * 1000;
}

export type PackStatus =
  | { state: "AVAILABLE" }
  | { state: "USED"; examId: number }
  | { state: "EXPOSED"; exposed: number }
  | { state: "INCOMPLETE"; size: number };

/** A sealed pack is only a fresh assessment if it is complete, unused, and none of its questions were ever shown. */
export function packStatus({ size, examLength, exposed, usedByExamId }: { size: number; examLength: number; exposed: number; usedByExamId: number | null }): PackStatus {
  if (usedByExamId !== null) return { state: "USED", examId: usedByExamId };
  if (size !== examLength) return { state: "INCOMPLETE", size };
  if (exposed > 0) return { state: "EXPOSED", exposed };
  return { state: "AVAILABLE" };
}
