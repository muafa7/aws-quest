import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";
import { ContentValidationError, loadAndValidateAll, type ContentBundle } from "./seeds/content";

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db";
const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });

async function databaseTotals(certificationId: number) {
  const inCertification = { topic: { certificationId } };
  const [concepts, lessons, questions, options] = await Promise.all([
    prisma.concept.count({ where: inCertification }),
    prisma.lesson.count({ where: { concept: inCertification } }),
    prisma.question.count({ where: { concept: inCertification } }),
    prisma.questionOption.count({ where: { question: { concept: inCertification } } }),
  ]);
  return `${concepts} concepts, ${lessons} lessons, ${questions} questions, ${options} options`;
}

async function seedCertification({ certification, topics, concepts, lessons, questions }: ContentBundle) {
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

  for (const { question } of questions) {
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

  console.log(
    `Seeded ${certification.code}: ${concepts.length} concepts, ${questions.length} questions ` +
      `(database: ${await databaseTotals(certificationRecord.id)})`,
  );
}

async function main() {
  const bundles = await loadAndValidateAll();
  for (const bundle of bundles) {
    await seedCertification(bundle);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error instanceof ContentValidationError ? error.message : error);
    await prisma.$disconnect();
    process.exit(1);
  });
