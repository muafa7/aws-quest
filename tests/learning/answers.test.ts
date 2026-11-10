import assert from "node:assert/strict";
import test from "node:test";
import {
  isExactPermutation,
  isValidSelection,
  optionLetter,
  parseKeyList,
  parseOptionSnapshot,
  sameAnswers,
  shuffled,
  snapshotOptions,
} from "../../src/lib/learning/answers";
import { explanationDisclosure, reviewOptions } from "../../src/lib/learning/feedback";

const keys = ["A", "B", "C", "D"];

function sequence(values: number[]) {
  let index = 0;
  return () => values[index++ % values.length];
}

test("shuffling keeps every option exactly once and leaves the input untouched", () => {
  const input = ["A", "B", "C", "D", "E"];
  const output = shuffled(input, sequence([0.9, 0.1, 0.5, 0.3]));
  assert.deepEqual([...output].sort(), input);
  assert.deepEqual(input, ["A", "B", "C", "D", "E"]);
});

test("the correct option is not pinned to the first position", () => {
  const firstPositions = new Set<string>();
  for (let seed = 0; seed < 40; seed++) firstPositions.add(shuffled(keys, sequence([(seed % 10) / 10, 0.37, 0.71]))[0]);
  assert.ok(firstPositions.size > 1);
});

test("letters are positional", () => {
  assert.deepEqual([0, 1, 4].map(optionLetter), ["A", "B", "E"]);
});

test("answers compare as sets of canonical keys", () => {
  assert.ok(sameAnswers(["C", "A"], ["A", "C"]));
  assert.ok(!sameAnswers(["A"], ["A", "C"]));
  assert.ok(!sameAnswers(["A", "A"], ["A", "B"]));
});

test("only an exact permutation of the question's keys is accepted as a shown order", () => {
  assert.ok(isExactPermutation(["C", "A", "D", "B"], keys));
  assert.ok(!isExactPermutation(["A", "B", "C"], keys));
  assert.ok(!isExactPermutation(["A", "A", "C", "D"], keys));
  assert.ok(!isExactPermutation(["A", "B", "C", "Z"], keys));
});

test("selections must be known, unique keys and single-choice allows exactly one", () => {
  assert.ok(isValidSelection(["B"], keys, "SINGLE_CHOICE"));
  assert.ok(!isValidSelection(["B", "C"], keys, "SINGLE_CHOICE"));
  assert.ok(isValidSelection(["B", "C"], keys, "MULTIPLE_CHOICE"));
  assert.ok(!isValidSelection([], keys, "MULTIPLE_CHOICE"));
  assert.ok(!isValidSelection(["Z"], keys, "MULTIPLE_CHOICE"));
  assert.ok(!isValidSelection(["B", "B"], keys, "MULTIPLE_CHOICE"));
});

test("malformed snapshots parse to null instead of throwing", () => {
  assert.equal(parseKeyList(null), null);
  assert.equal(parseKeyList("not json"), null);
  assert.equal(parseKeyList('[1, "A"]'), null);
  assert.deepEqual(parseKeyList('["B","A"]'), ["B", "A"]);
  assert.equal(parseOptionSnapshot('[{"key":"A"}]'), null);
  assert.deepEqual(parseOptionSnapshot(snapshotOptions([{ key: "A", text: "One" }])), [{ key: "A", text: "One", explanation: null }]);
});

const current = [
  { key: "A", text: "Current A", explanation: "Why A" },
  { key: "B", text: "Current B", explanation: null },
  { key: "C", text: "Current C", explanation: "Why C" },
];

test("review uses the order and wording the learner actually saw", () => {
  const rows = reviewOptions({
    isCorrect: false,
    confidence: "HIGH",
    selectedOptionsSnapshot: '["B"]',
    correctOptionsSnapshot: '["C"]',
    optionOrderSnapshot: '["C","A","B"]',
    optionsSnapshot: snapshotOptions([
      { key: "A", text: "Old A", explanation: "Old why A" },
      { key: "B", text: "Old B" },
      { key: "C", text: "Old C", explanation: "Old why C" },
    ]),
  }, current);
  assert.deepEqual(rows.map((row) => `${row.letter}:${row.key}:${row.text}`), ["A:C:Old C", "B:A:Old A", "C:B:Old B"]);
  assert.deepEqual(rows.filter((row) => row.selected).map((row) => row.letter), ["C"]);
  assert.deepEqual(rows.filter((row) => row.correct).map((row) => row.letter), ["A"]);
});

test("answers recorded before snapshots fall back to current options in key order", () => {
  const rows = reviewOptions({ isCorrect: true, confidence: "LOW", selectedOptionsSnapshot: '["A"]', correctOptionsSnapshot: '["A"]' }, current);
  assert.deepEqual(rows.map((row) => `${row.letter}:${row.text}`), ["A:Current A", "B:Current B", "C:Current C"]);
  assert.equal(rows[0].explanation, "Why A");
});

test("keys missing from the current options are still listed instead of dropped", () => {
  const rows = reviewOptions({ isCorrect: false, confidence: "MEDIUM", selectedOptionsSnapshot: '["E"]', correctOptionsSnapshot: '["A"]' }, current);
  const removed = rows.find((row) => row.key === "E");
  assert.ok(removed?.selected);
  assert.match(removed.text, /no longer available/);
});

test("wrong or unsure answers open the explanation; confident correct answers keep it one click away", () => {
  assert.deepEqual(explanationDisclosure(false, "HIGH"), { expanded: true, keyNoteVisible: true });
  assert.deepEqual(explanationDisclosure(true, "LOW"), { expanded: true, keyNoteVisible: true });
  assert.deepEqual(explanationDisclosure(true, "MEDIUM"), { expanded: false, keyNoteVisible: true });
  assert.deepEqual(explanationDisclosure(true, "HIGH"), { expanded: false, keyNoteVisible: false });
  assert.equal(explanationDisclosure(false, null).expanded, true);
});
