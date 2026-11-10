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

    const fields = {
      conceptId,
      type: question.type,
      difficulty: question.difficulty,
      style: question.style,
      prompt: question.question,
      active: question.active,
      sourceTitle: question.source?.title,
      sourceUrl: question.source?.url,
      assessmentPackId: question.assessmentPack ?? null,
    };
    const record = await prisma.question.upsert({
      where: { code: question.code },
      update: fields,
      create: { code: question.code, ...fields },
    });

    await prisma.$transaction([
      prisma.questionOption.deleteMany({ where: { questionId: record.id } }),
      prisma.questionTag.deleteMany({ where: { questionId: record.id } }),
      prisma.questionOption.createMany({
        data: question.options.map((option) => ({
          questionId: record.id,
          key: option.key,
          text: option.text,
          isCorrect: option.correct,
          explanation: option.explanation ?? null,
        })),
      }),
      prisma.questionTag.createMany({
        data: question.tags.map((tag) => ({ questionId: record.id, tag })),
      }),
    ]);
  }

  // Content removed from the seed files is retired rather than deleted, so attempts
  // and mock history that reference it stay intact.
  const inCertification = { topic: { certificationId: certificationRecord.id } };
  const retiredQuestions = await prisma.question.updateMany({
    where: { concept: inCertification, code: { notIn: questions.map(({ question }) => question.code) }, active: true },
    data: { active: false },
  });
  const retiredConcepts = await prisma.concept.updateMany({
    where: { ...inCertification, slug: { notIn: concepts.map((concept) => concept.slug) }, active: true },
    data: { active: false },
  });
  const retired = retiredQuestions.count + retiredConcepts.count > 0
    ? `; retired ${retiredConcepts.count} concepts and ${retiredQuestions.count} questions no longer in the seed files`
    : "";

  console.log(
    `Seeded ${certification.code}: ${concepts.length} concepts, ${questions.length} questions ` +
      `(database: ${await databaseTotals(certificationRecord.id)})${retired}`,
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
