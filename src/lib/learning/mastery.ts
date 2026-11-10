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

/**
 * A concept is cleared by independent recall in Practice: the latest three answers
 * must be correct, not LOW confidence, on three different questions, and not all on
 * the same day. Repeating one question or rattling off answers in one sitting cannot
 * manufacture mastery. Attempts must be in chronological order.
 */
export function meetsMastery(practiceAttempts: readonly MasteryAttempt[]) {
  const recent = practiceAttempts.slice(-MASTERY_WINDOW);
  if (recent.length < MASTERY_WINDOW) return false;
  if (!recent.every((attempt) => attempt.isCorrect && attempt.confidence !== "LOW" && attempt.confidence !== null)) return false;
  if (new Set(recent.map((attempt) => attempt.questionId)).size < MASTERY_WINDOW) return false;
  return new Set(recent.map((attempt) => utcDay(attempt.answeredAt))).size >= 2;
}
