export type ChallengeProgress = {
  done: number;
  total: number;
  remaining: number;
  /** Every training question has been answered at least once. An empty bank cannot clear. */
  cleared: boolean;
};

/** A stage clears by covering its challenges. One answer per question is enough, on any day. */
export function challengeProgress(questionIds: readonly number[], answeredQuestionIds: readonly number[]): ChallengeProgress {
  const bank = new Set(questionIds);
  let done = 0;
  for (const id of new Set(answeredQuestionIds)) if (bank.has(id)) done += 1;
  return { done, total: bank.size, remaining: bank.size - done, cleared: bank.size > 0 && done === bank.size };
}
