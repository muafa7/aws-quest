import { optionLetter, parseKeyList, parseOptionSnapshot, type OptionSnapshot } from "./answers";

export type AnswerRecord = {
  isCorrect: boolean;
  confidence: string | null;
  selectedOptionsSnapshot: string | null;
  correctOptionsSnapshot: string;
  optionOrderSnapshot?: string | null;
  optionsSnapshot?: string | null;
};

export type ReviewOption = {
  key: string;
  letter: string;
  text: string;
  explanation: string | null;
  selected: boolean;
  correct: boolean;
};

const unavailable = "This option is no longer available.";

/**
 * Rebuilds the options exactly as the learner saw them. Answers recorded before
 * shuffling have no order snapshot; those were shown in key order with key letters.
 */
export function reviewOptions(record: AnswerRecord, currentOptions: readonly OptionSnapshot[]): ReviewOption[] {
  const options = parseOptionSnapshot(record.optionsSnapshot) ?? currentOptions;
  const selected = parseKeyList(record.selectedOptionsSnapshot) ?? [];
  const correct = parseKeyList(record.correctOptionsSnapshot) ?? [];
  const shownOrder = parseKeyList(record.optionOrderSnapshot);
  const keys = shownOrder ?? [...options.map((option) => option.key)].sort();
  for (const key of [...selected, ...correct]) if (!keys.includes(key)) keys.push(key);

  return keys.map((key, index) => {
    const option = options.find((candidate) => candidate.key === key);
    return {
      key,
      letter: shownOrder ? optionLetter(index) : key,
      text: option?.text ?? unavailable,
      explanation: option?.explanation ?? null,
      selected: selected.includes(key),
      correct: correct.includes(key),
    };
  });
}

/**
 * Wrong or unsure answers open the full review. A confident correct answer stays
 * quiet but keeps the explanation one click away, so a lucky guess can be checked.
 */
export function explanationDisclosure(isCorrect: boolean, confidence: string | null) {
  const expanded = !isCorrect || confidence === "LOW" || confidence === null;
  return { expanded, keyNoteVisible: expanded || confidence === "MEDIUM" };
}
