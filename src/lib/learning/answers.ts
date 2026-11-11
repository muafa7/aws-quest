// Option keys from the seed (A, B, C...) are canonical identities used for grading.
// Learners see options in a shuffled order with positional letters, so the two must
// never be confused: grade on keys, display by position.

export type OptionSnapshot = { key: string; text: string; explanation?: string | null };

export function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function optionLetter(index: number) {
  return String.fromCharCode(65 + index);
}

export function sameAnswers(a: readonly string[], b: readonly string[]) {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((key, index) => key === right[index]);
}

export function isExactPermutation(incoming: readonly string[], permitted: readonly string[]) {
  return incoming.length === permitted.length && new Set(incoming).size === incoming.length && incoming.every((key) => permitted.includes(key));
}

export function isValidSelection(selected: readonly string[], permitted: readonly string[], type: string) {
  if (selected.length === 0 || new Set(selected).size !== selected.length) return false;
  if (!selected.every((key) => permitted.includes(key))) return false;
  return type !== "SINGLE_CHOICE" || selected.length === 1;
}

export function snapshotOptions(options: readonly OptionSnapshot[]) {
  return JSON.stringify(options.map(({ key, text, explanation }) => ({ key, text, explanation: explanation ?? null })));
}

function parseJson(raw: string | null | undefined): unknown {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Historic or hand-edited snapshots may be missing or malformed; callers fall back instead of crashing. */
export function parseKeyList(raw: string | null | undefined): string[] | null {
  const value = parseJson(raw);
  return Array.isArray(value) && value.every((key) => typeof key === "string") ? value : null;
}

export function parseOptionSnapshot(raw: string | null | undefined): OptionSnapshot[] | null {
  const value = parseJson(raw);
  if (!Array.isArray(value)) return null;
  const valid = value.every(
    (option) =>
      typeof option === "object" && option !== null &&
      typeof option.key === "string" && typeof option.text === "string" &&
      (option.explanation === undefined || option.explanation === null || typeof option.explanation === "string"),
  );
  return valid ? (value as OptionSnapshot[]) : null;
}
