import "dotenv/config";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import {
  certificationSchema,
  conceptSchema,
  lessonSchema,
  questionSchema,
  topicSchema,
  type CertificationSeed,
  type ConceptSeed,
  type LessonSeed,
  type QuestionSeed,
  type TopicSeed,
} from "./seeds/schema";

const seedRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "seeds");
const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function loadQuestions(directory: string): Promise<QuestionSeed[]> {
  const questionDir = path.join(directory, "questions");
  const files = (await readdir(questionDir)).filter((file) => file.endsWith(".json")).sort();
  const result: QuestionSeed[] = [];

  for (const file of files) {
    const raw = await readJson<unknown[]>(path.join(questionDir, file));
    result.push(...raw.map((question) => questionSchema.parse(question)));
  }

  return result;
}

function validateBundle(
  certification: CertificationSeed,
  topics: TopicSeed[],
  concepts: ConceptSeed[],
  lessons: LessonSeed[],
  questions: QuestionSeed[],
) {
  const topicSlugs = new Set(topics.map((topic) => topic.slug));
  const conceptSlugs = new Set(concepts.map((concept) => concept.slug));
  const codes = new Set<string>();

  for (const concept of concepts) {
    if (!topicSlugs.has(concept.topic)) {
      throw new Error(`${certification.code}: unknown topic '${concept.topic}' for concept '${concept.slug}'`);
    }
  }

  for (const lesson of lessons) {
    if (!conceptSlugs.has(lesson.concept)) {
      throw new Error(`${certification.code}: unknown concept '${lesson.concept}' in lesson seed`);
    }
  }

  for (const question of questions) {
    if (codes.has(question.code)) {
      throw new Error(`${certification.code}: duplicate question code '${question.code}'`);
    }
    codes.add(question.code);

    if (!conceptSlugs.has(question.concept)) {
      throw new Error(`${question.code}: unknown concept '${question.concept}'`);
    }

    const optionKeys = new Set<string>();
    for (const option of question.options) {
      if (optionKeys.has(option.key)) {
        throw new Error(`${question.code}: duplicate option key '${option.key}'`);
      }
      optionKeys.add(option.key);
    }

    const correctCount = question.options.filter((option) => option.correct).length;
    if (question.type === "SINGLE_CHOICE" && correctCount !== 1) {
      throw new Error(`${question.code}: SINGLE_CHOICE requires exactly 1 correct option; found ${correctCount}`);
    }
    if (question.type === "MULTIPLE_CHOICE" && correctCount < 2) {
      throw new Error(`${question.code}: MULTIPLE_CHOICE requires at least 2 correct options; found ${correctCount}`);
    }
  }
}

async function seedCertification(directoryName: string) {
  const directory = path.join(seedRoot, directoryName);

  const certification = certificationSchema.parse(
    await readJson<unknown>(path.join(directory, "certification.json")),
  );
  const topics = topicSchema.array().parse(await readJson<unknown>(path.join(directory, "topics.json")));
  const concepts = conceptSchema.array().parse(await readJson<unknown>(path.join(directory, "concepts.json")));
  const lessons = lessonSchema.array().parse(await readJson<unknown>(path.join(directory, "lessons.json")));
  const questions = await loadQuestions(directory);

  validateBundle(certification, topics, concepts, lessons, questions);

  const certificationRecord = await prisma.certification.upsert({
    where: { code: certification.code },
    update: certification,
    create: certification,
  });

  const topicIds = new Map<string, number>();
  for (const topic of topics) {
    const record = await prisma.topic.upsert({
      where: {
        certificationId_slug: {
          certificationId: certificationRecord.id,
          slug: topic.slug,
        },
      },
      update: {
        name: topic.name,
        order: topic.order,
        weight: topic.weight,
      },
      create: {
        certificationId: certificationRecord.id,
        ...topic,
      },
    });
    topicIds.set(topic.slug, record.id);
  }

  const conceptIds = new Map<string, number>();
  for (const concept of concepts) {
    const topicId = topicIds.get(concept.topic);
    if (!topicId) throw new Error(`Missing topic '${concept.topic}' while seeding '${concept.slug}'`);

    const record = await prisma.concept.upsert({
      where: { slug: concept.slug },
      update: {
        topicId,
        name: concept.name,
        generalExplanation: concept.generalExplanation,
        keyNote: concept.keyNote,
        referenceUrl: concept.referenceUrl,
        order: concept.order,
        active: concept.active,
      },
      create: {
        topicId,
        slug: concept.slug,
        name: concept.name,
        generalExplanation: concept.generalExplanation,
        keyNote: concept.keyNote,
        referenceUrl: concept.referenceUrl,
        order: concept.order,
        active: concept.active,
      },
    });
    conceptIds.set(concept.slug, record.id);
  }

  for (const lesson of lessons) {
    const conceptId = conceptIds.get(lesson.concept);
    if (!conceptId) throw new Error(`Missing concept '${lesson.concept}' while seeding lesson`);

    await prisma.lesson.upsert({
      where: { conceptId },
      update: {
        title: lesson.title,
        summary: lesson.summary,
        keyPoints: JSON.stringify(lesson.keyPoints),
        order: lesson.order,
      },
      create: {
        conceptId,
        title: lesson.title,
        summary: lesson.summary,
        keyPoints: JSON.stringify(lesson.keyPoints),
        order: lesson.order,
      },
    });
  }

  for (const question of questions) {
    const conceptId = conceptIds.get(question.concept);
    if (!conceptId) throw new Error(`Missing concept '${question.concept}' while seeding '${question.code}'`);

    const record = await prisma.question.upsert({
      where: { code: question.code },
      update: {
        conceptId,
        type: question.type,
        difficulty: question.difficulty,
        style: question.style,
        prompt: question.question,
        active: question.active,
        sourceTitle: question.source?.title,
        sourceUrl: question.source?.url,
      },
      create: {
        code: question.code,
        conceptId,
        type: question.type,
        difficulty: question.difficulty,
        style: question.style,
        prompt: question.question,
        active: question.active,
        sourceTitle: question.source?.title,
        sourceUrl: question.source?.url,
      },
    });

    await prisma.questionOption.deleteMany({ where: { questionId: record.id } });
    await prisma.questionTag.deleteMany({ where: { questionId: record.id } });

    await prisma.questionOption.createMany({
      data: question.options.map((option) => ({
        questionId: record.id,
        key: option.key,
        text: option.text,
        isCorrect: option.correct,
      })),
    });

    if (question.tags.length > 0) {
      await prisma.questionTag.createMany({
        data: question.tags.map((tag) => ({ questionId: record.id, tag })),
      });
    }
  }

  console.log(`Seeded ${certification.code}: ${concepts.length} concepts, ${questions.length} questions`);
}

async function main() {
  await seedCertification("clf-c02");
  await seedCertification("saa-c03");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
