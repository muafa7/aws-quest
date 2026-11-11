export type MasteryAttempt = {
  questionId: number;
  isCorrect: boolean;
  confidence: string | null;
  answeredAt: Date;
};

export const MASTERY_WINDOW = 3;

function utcDay(date: Date) {
  return date.toISOString().slice(0, 10);
}

function startOfNextUtcDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
}

function counts(attempt: MasteryAttempt) {
  return attempt.isCorrect && attempt.confidence !== "LOW" && attempt.confidence !== null;
}

/** The latest answers, oldest first, that count and are on different questions; at most MASTERY_WINDOW. */
function countingRun(practiceAttempts: readonly MasteryAttempt[]) {
  const run: MasteryAttempt[] = [];
  const questions = new Set<number>();
  for (let index = practiceAttempts.length - 1; index >= 0 && run.length < MASTERY_WINDOW; index -= 1) {
    const attempt = practiceAttempts[index];
    if (!attempt || !counts(attempt) || questions.has(attempt.questionId)) break;
    questions.add(attempt.questionId);
    run.unshift(attempt);
  }
  return run;
}

/**
 * A concept is cleared by independent recall in Practice: the latest three answers
 * must be correct, not LOW confidence, on three different questions, and not all on
 * the same day. Repeating one question or rattling off answers in one sitting cannot
 * manufacture mastery. Attempts must be in chronological order.
 */
export function meetsMastery(practiceAttempts: readonly MasteryAttempt[]) {
  const run = countingRun(practiceAttempts);
  return run.length === MASTERY_WINDOW && new Set(run.map((attempt) => utcDay(attempt.answeredAt))).size >= 2;
}

export type ClearProgress = {
  /** Answers that will still be in the window when the next one lands. */
  counted: number;
  /** Further counting Practice answers needed to clear. */
  remaining: number;
  /** Set when the last missing answer cannot clear today: the start of the next UTC day. */
  notBefore: Date | null;
};

/**
 * How far a concept that is not cleared is from clearing, by the meetsMastery rule.
 * A full window that did not clear (one sitting, or a miss elsewhere reset the clear)
 * still needs one more answer, because its oldest answer drops out.
 */
export function clearProgress(practiceAttempts: readonly MasteryAttempt[], now = new Date()): ClearProgress {
  const run = countingRun(practiceAttempts);
  const kept = run.length === MASTERY_WINDOW ? run.slice(1) : run;
  const remaining = MASTERY_WINDOW - kept.length;
  const today = utcDay(now);
  const lastMustWait = remaining === 1 && kept.every((attempt) => utcDay(attempt.answeredAt) === today);
  return { counted: kept.length, remaining, notBefore: lastMustWait ? startOfNextUtcDay(now) : null };
}
