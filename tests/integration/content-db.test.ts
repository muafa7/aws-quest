import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, test } from "node:test";

// Runs migrations and the real seed against a throwaway SQLite file; never touches dev.db.
const directory = mkdtempSync(path.join(tmpdir(), "aws-quest-db-"));
process.env.DATABASE_URL = `file:${path.join(directory, "integration.db").replaceAll("\\", "/")}`;

const root = path.resolve(import.meta.dirname, "../..");
const run = (script: string, ...args: string[]) =>
  execFileSync(process.execPath, [path.join(root, script), ...args], { cwd: root, env: process.env, stdio: "pipe" }).toString();
const migrate = () => run("node_modules/prisma/build/index.js", "migrate", "deploy");
const seed = () => run("node_modules/tsx/dist/cli.mjs", "prisma/seed.ts");

type Modules = {
  prisma: typeof import("../../src/lib/prisma").prisma;
  selector: typeof import("../../src/lib/learning/selector");
};
let modules: Modules;

before(async () => {
  migrate();
  seed();
  modules = {
    prisma: (await import("../../src/lib/prisma")).prisma,
    selector: await import("../../src/lib/learning/selector"),
  };
});

after(async () => {
  await modules?.prisma.$disconnect();
  rmSync(directory, { recursive: true, force: true });
});

async function questionCounts(code: string) {
  const inCertification = { concept: { topic: { certification: { code } } } };
  const { prisma } = modules;
  const [training, reserved, inactive] = await Promise.all([
    prisma.question.count({ where: { ...inCertification, active: true, assessmentPackId: null } }),
    prisma.question.count({ where: { ...inCertification, active: true, assessmentPackId: { not: null } } }),
    prisma.question.count({ where: { ...inCertification, active: false } }),
  ]);
  return { training, reserved, inactive };
}

test("migrations and seed install the full CCP and SAA banks", async () => {
  assert.deepEqual(await questionCounts("CLF-C02"), { training: 415, reserved: 0, inactive: 0 });
  assert.deepEqual(await questionCounts("SAA-C03"), { training: 270, reserved: 130, inactive: 0 });
  const packs = await modules.prisma.question.groupBy({ by: ["assessmentPackId"], where: { assessmentPackId: { not: null } }, _count: true });
  assert.deepEqual(packs.map((p) => [p.assessmentPackId, p._count]).sort(), [["SAA-C03-FRESH-A", 65], ["SAA-C03-FRESH-B", 65]]);
  const explained = await modules.prisma.questionOption.count({ where: { explanation: { not: null }, question: { code: { startsWith: "SAA-" } } } });
  assert.equal(explained, 1632);
});

test("re-seeding keeps question identities and history, and retires removed content", async () => {
  const { prisma } = modules;
  const before = new Map((await prisma.question.findMany({ select: { id: true, code: true } })).map((q) => [q.code, q.id]));

  // Simulates the old SAA starter question that existed before the full bank shipped.
  const topic = await prisma.topic.findFirstOrThrow({ where: { slug: "resilient-architectures" } });
  const stale = await prisma.concept.create({
    data: { topicId: topic.id, slug: "saa-rds-multi-az", name: "RDS Multi-AZ", generalExplanation: "x", order: 99 },
  });
  const staleQuestion = await prisma.question.create({
    data: {
      code: "SAA-RDS-001", conceptId: stale.id, type: "SINGLE_CHOICE", difficulty: "EASY", style: "BASIC", prompt: "Old starter",
      options: { create: [{ key: "A", text: "Yes", isCorrect: true }, { key: "B", text: "No" }] },
    },
  });
  const attempt = await prisma.attempt.create({
    data: {
      questionId: staleQuestion.id, mode: "PRACTICE", confidence: "HIGH", isCorrect: true,
      questionTextSnapshot: "Old starter", selectedOptionsSnapshot: '["A"]', correctOptionsSnapshot: '["A"]',
    },
  });

  seed();

  const afterSeed = new Map((await prisma.question.findMany({ select: { id: true, code: true } })).map((q) => [q.code, q.id]));
  for (const [code, id] of before) assert.equal(afterSeed.get(code), id, `${code} kept its database id`);
  assert.deepEqual(await questionCounts("CLF-C02"), { training: 415, reserved: 0, inactive: 0 });
  assert.deepEqual(await questionCounts("SAA-C03"), { training: 270, reserved: 130, inactive: 1 });
  assert.equal((await prisma.concept.findUniqueOrThrow({ where: { id: stale.id } })).active, false);
  assert.ok(await prisma.attempt.findUnique({ where: { id: attempt.id } }), "history on retired questions is preserved");
});

test("answer reviews keep the order and wording that was shown, even after content edits", async () => {
  const { prisma } = modules;
  const { snapshotOptions } = await import("../../src/lib/learning/answers");
  const { reviewOptions } = await import("../../src/lib/learning/feedback");
  const question = await prisma.question.findFirstOrThrow({
    where: { code: { startsWith: "CCP-" }, type: "SINGLE_CHOICE" },
    include: { options: { orderBy: { key: "asc" } } },
  });
  const shown = [...question.options].reverse().map((option) => option.key);
  const correct = question.options.filter((option) => option.isCorrect).map((option) => option.key);
  const attempt = await prisma.attempt.create({
    data: {
      questionId: question.id, mode: "LEARN", confidence: "HIGH", isCorrect: true, questionTextSnapshot: question.prompt,
      selectedOptionsSnapshot: JSON.stringify(correct), correctOptionsSnapshot: JSON.stringify(correct),
      optionOrderSnapshot: JSON.stringify(shown), optionsSnapshot: snapshotOptions(question.options),
    },
  });
  const edited = question.options[0];
  await prisma.questionOption.update({ where: { id: edited.id }, data: { text: "Edited after the answer" } });

  const stored = await prisma.attempt.findUniqueOrThrow({ where: { id: attempt.id } });
  const current = await prisma.questionOption.findMany({ where: { questionId: question.id }, select: { key: true, text: true, explanation: true } });
  const rows = reviewOptions(stored, current);
  assert.deepEqual(rows.map((row) => row.key), shown);
  assert.equal(rows.find((row) => row.key === edited.key)?.text, edited.text);
  assert.equal(rows.find((row) => row.correct)?.letter, String.fromCharCode(65 + shown.indexOf(correct[0])));
  await prisma.questionOption.update({ where: { id: edited.id }, data: { text: edited.text } });
});

test("reserved questions never reach Learn or Practice", async () => {
  const { prisma, selector } = modules;
  const reserved = await prisma.question.findFirstOrThrow({ where: { assessmentPackId: { not: null } } });
  assert.equal(await selector.getSafeQuestionById(reserved.id), null);

  const session = await prisma.practiceSession.create({ data: { certification: { connect: { code: "SAA-C03" } } } });
  for (let i = 0; i < 60; i++) {
    const picked = await selector.selectPracticeQuestion("SAA-C03");
    assert.ok(picked, "practice always has a training question");
    const row = await prisma.question.findUniqueOrThrow({ where: { id: picked.id }, select: { assessmentPackId: true, active: true } });
    assert.deepEqual(row, { assessmentPackId: null, active: true });
    await prisma.attempt.create({
      data: {
        questionId: picked.id, practiceSessionId: session.id, mode: "PRACTICE", confidence: "MEDIUM", isCorrect: i % 3 !== 0,
        questionTextSnapshot: picked.prompt, selectedOptionsSnapshot: "[]", correctOptionsSnapshot: "[]",
      },
    });
  }
});
