import assert from "node:assert/strict";
import test from "node:test";
import { loadAndValidateAll, validateBundles, type ContentBundle, type LoadedQuestion } from "../../prisma/seeds/content";
import type { QuestionSeed } from "../../prisma/seeds/schema";

function question(code: string, concept: string, overrides: Partial<QuestionSeed> = {}): QuestionSeed {
  return {
    code,
    concept,
    type: "SINGLE_CHOICE",
    difficulty: "EASY",
    style: "BASIC",
    question: "Which option is correct?",
    options: [
      { key: "A", text: "Right", correct: true },
      { key: "B", text: "Wrong", correct: false },
    ],
    tags: [],
    active: true,
    ...overrides,
  };
}

const twoCorrect = [
  { key: "A", text: "Right", correct: true },
  { key: "B", text: "Also right", correct: true },
  { key: "C", text: "Wrong", correct: false },
];

function bundle(questions: LoadedQuestion[], { examQuestionCount = 65, prefix = "TST" } = {}): ContentBundle {
  const concepts = [
    { topic: "alpha", slug: `${prefix.toLowerCase()}-a1`, name: "A1", generalExplanation: "x", order: 1, active: true },
    { topic: "alpha", slug: `${prefix.toLowerCase()}-a2`, name: "A2", generalExplanation: "x", order: 2, active: true },
    { topic: "beta", slug: `${prefix.toLowerCase()}-b1`, name: "B1", generalExplanation: "x", order: 1, active: true },
  ];
  return {
    directory: `${prefix.toLowerCase()}-cert`,
    certification: { code: `${prefix}-C01`, name: "Test", examQuestionCount, durationMinutes: 60, active: true },
    topics: [
      { slug: "alpha", name: "Alpha", order: 1, weight: 0.5 },
      { slug: "beta", name: "Beta", order: 2, weight: 0.5 },
    ],
    concepts,
    lessons: concepts.map((concept) => ({ concept: concept.slug, title: concept.name, summary: "x", keyPoints: ["x"], order: 1 })),
    questions,
  };
}

const issuesFor = (questions: LoadedQuestion[], options?: Parameters<typeof bundle>[1]) => validateBundles([bundle(questions, options)]);

test("a code prefix may span several concepts inside one topic (SAA domain families)", () => {
  assert.deepEqual(issuesFor([
    { file: "alpha.json", question: question("TST-ALP-001", "tst-a1") },
    { file: "alpha.json", question: question("TST-ALP-002", "tst-a2") },
  ]), []);
});

test("a code prefix may not span two topics", () => {
  const issues = issuesFor([
    { file: "alpha.json", question: question("TST-MIX-001", "tst-a1") },
    { file: "beta.json", question: question("TST-MIX-002", "tst-b1") },
  ]);
  assert.equal(issues.length, 1);
  assert.match(issues[0], /Code prefix TST-MIX belongs to topic 'alpha'/);
});

test("multiple-choice prompts accept '(Select TWO.)' and inline 'Select TWO.'", () => {
  assert.deepEqual(issuesFor([
    { file: "alpha.json", question: question("TST-ALP-001", "tst-a1", { type: "MULTIPLE_CHOICE", question: "Pick two. (Select TWO.)", options: twoCorrect }) },
    { file: "alpha.json", question: question("TST-ALP-002", "tst-a1", { type: "MULTIPLE_CHOICE", question: "Pick two. Select TWO.", options: twoCorrect }) },
  ]), []);
  const missing = issuesFor([
    { file: "alpha.json", question: question("TST-ALP-003", "tst-a1", { type: "MULTIPLE_CHOICE", question: "Pick some.", options: twoCorrect }) },
  ]);
  assert.match(missing.join("\n"), /must include '\(Select TWO\.\)' or 'Select TWO\.'/);
});

test("single-choice prompts reject a Select N instruction in either form", () => {
  const issues = issuesFor([
    { file: "alpha.json", question: question("TST-ALP-001", "tst-a1", { question: "Pick one. Select TWO." }) },
  ]);
  assert.match(issues.join("\n"), /SINGLE_CHOICE prompt must not contain/);
});

test("reserved questions must live in *.reserved.json and declare a pack", () => {
  const issues = issuesFor([
    { file: "alpha.json", question: question("TST-ALP-001", "tst-a1", { assessmentPack: "TST-C01-FRESH-A" }) },
    { file: "alpha.reserved.json", question: question("TST-ALP-002", "tst-a1") },
  ], { examQuestionCount: 1 });
  assert.match(issues.join("\n"), /Reserved questions must live in <topic-slug>\.reserved\.json/);
  assert.match(issues.join("\n"), /must declare an assessmentPack/);
});

function reservedPack(alpha: number, beta: number, pack = "TST-C01-FRESH-A"): LoadedQuestion[] {
  return [
    ...Array.from({ length: alpha }, (_, i) => ({ file: "alpha.reserved.json", question: question(`TST-ALP-${String(i + 1).padStart(3, "0")}`, "tst-a1", { assessmentPack: pack }) })),
    ...Array.from({ length: beta }, (_, i) => ({ file: "beta.reserved.json", question: question(`TST-BET-${String(i + 1).padStart(3, "0")}`, "tst-b1", { assessmentPack: pack }) })),
  ];
}

test("an assessment pack must match the exam length and domain blueprint", () => {
  assert.deepEqual(issuesFor(reservedPack(5, 5), { examQuestionCount: 10 }), []);
  assert.deepEqual(issuesFor(reservedPack(6, 4), { examQuestionCount: 10 }), [], "±1 per domain is tolerated");
  assert.match(issuesFor(reservedPack(5, 4), { examQuestionCount: 10 }).join("\n"), /has 9 active questions; TST-C01 exams need 10/);
  assert.match(issuesFor(reservedPack(8, 2), { examQuestionCount: 10 }).join("\n"), /alpha: 8, expected 5/);
});

test("question codes stay globally unique across certifications", () => {
  const first = bundle([{ file: "alpha.json", question: question("TST-ALP-001", "tst-a1") }]);
  const second = bundle([{ file: "alpha.json", question: question("TST-ALP-001", "oth-a1") }], { prefix: "OTH" });
  assert.match(validateBundles([first, second]).join("\n"), /Question code is already used by tst-cert/);
});

test("shipped content keeps every CCP question and integrates all 400 SAA questions", async () => {
  const bundles = await loadAndValidateAll();
  const byCode = new Map(bundles.map((b) => [b.certification.code, b.questions.map(({ question }) => question)]));
  const clf = byCode.get("CLF-C02") ?? [];
  const saa = byCode.get("SAA-C03") ?? [];

  assert.equal(clf.filter((q) => q.active && !q.assessmentPack).length, 415);
  assert.equal(clf.filter((q) => q.assessmentPack).length, 0);
  assert.equal(saa.length, 400);
  assert.equal(saa.filter((q) => !q.assessmentPack).length, 270);
  assert.equal(saa.filter((q) => q.assessmentPack === "SAA-C03-FRESH-A").length, 65);
  assert.equal(saa.filter((q) => q.assessmentPack === "SAA-C03-FRESH-B").length, 65);
  assert.ok(saa.every((q) => q.options.every((option) => option.explanation)), "every SAA option has an explanation");

  const codes = [...clf, ...saa].map((q) => q.code);
  assert.equal(new Set(codes).size, 815);
  assert.ok(!codes.some((code) => code.startsWith("SAA-RDS-")), "starter questions are retired from the seed files");
});
