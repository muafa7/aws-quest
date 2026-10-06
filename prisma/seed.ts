import "dotenv/config";

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../generated/prisma/client";

import {
  loadAllSeedBundles,
  validateSeedBundles,
  type SeedBundle,
} from "./seeds/bundle";

const connectionString =
  process.env.DATABASE_URL ??
  "file:./dev.db";

const adapter =
  new PrismaBetterSqlite3({
    url: connectionString,
  });

const prisma = new PrismaClient({
  adapter,
});

async function seedBundle(
  bundle: SeedBundle,
) {
  const {
    certification,
    topics,
    concepts,
    lessons,
    questions,
  } = bundle;

  /*
   * Certification
   */

  const certificationRecord =
    await prisma.certification.upsert({
      where: {
        code: certification.code,
      },

      update: certification,

      create: certification,
    });

  /*
   * Topics
   */

  const topicIds = new Map<
    string,
    number
  >();

  for (const topic of topics) {
    const record =
      await prisma.topic.upsert({
        where: {
          certificationId_slug: {
            certificationId:
              certificationRecord.id,

            slug: topic.slug,
          },
        },

        update: {
          name: topic.name,
          order: topic.order,
          weight: topic.weight,
        },

        create: {
          certificationId:
            certificationRecord.id,

          ...topic,
        },
      });

    topicIds.set(
      topic.slug,
      record.id,
    );
  }

  /*
   * Concepts
   */

  const conceptIds = new Map<
    string,
    number
  >();

  for (const concept of concepts) {
    const topicId = topicIds.get(
      concept.topic,
    );

    if (!topicId) {
      throw new Error(
        `Missing topic '${concept.topic}' while seeding '${concept.slug}'`,
      );
    }

    const record =
      await prisma.concept.upsert({
        where: {
          slug: concept.slug,
        },

        update: {
          topicId,

          name: concept.name,

          generalExplanation:
            concept.generalExplanation,

          keyNote: concept.keyNote,

          referenceUrl:
            concept.referenceUrl,

          order: concept.order,

          active: concept.active,
        },

        create: {
          topicId,

          slug: concept.slug,

          name: concept.name,

          generalExplanation:
            concept.generalExplanation,

          keyNote: concept.keyNote,

          referenceUrl:
            concept.referenceUrl,

          order: concept.order,

          active: concept.active,
        },
      });

    conceptIds.set(
      concept.slug,
      record.id,
    );
  }

  /*
   * Lessons
   */

  for (const lesson of lessons) {
    const conceptId = conceptIds.get(
      lesson.concept,
    );

    if (!conceptId) {
      throw new Error(
        `Missing concept '${lesson.concept}' while seeding lesson`,
      );
    }

    await prisma.lesson.upsert({
      where: {
        conceptId,
      },

      update: {
        title: lesson.title,

        summary: lesson.summary,

        keyPoints: JSON.stringify(
          lesson.keyPoints,
        ),

        order: lesson.order,
      },

      create: {
        conceptId,

        title: lesson.title,

        summary: lesson.summary,

        keyPoints: JSON.stringify(
          lesson.keyPoints,
        ),

        order: lesson.order,
      },
    });
  }

  /*
   * Questions
   */

  for (const question of questions) {
    const conceptId = conceptIds.get(
      question.concept,
    );

    if (!conceptId) {
      throw new Error(
        `Missing concept '${question.concept}' while seeding '${question.code}'`,
      );
    }

    const record =
      await prisma.question.upsert({
        where: {
          code: question.code,
        },

        update: {
          conceptId,

          type: question.type,

          difficulty:
            question.difficulty,

          style: question.style,

          prompt: question.question,

          active: question.active,

          sourceTitle:
            question.source?.title,

          sourceUrl:
            question.source?.url,
        },

        create: {
          code: question.code,

          conceptId,

          type: question.type,

          difficulty:
            question.difficulty,

          style: question.style,

          prompt: question.question,

          active: question.active,

          sourceTitle:
            question.source?.title,

          sourceUrl:
            question.source?.url,
        },
      });

    /*
     * Replace child data so the JSON files
     * remain the source of truth.
     */

    await prisma.questionOption.deleteMany(
      {
        where: {
          questionId: record.id,
        },
      },
    );

    await prisma.questionTag.deleteMany({
      where: {
        questionId: record.id,
      },
    });

    await prisma.questionOption.createMany(
      {
        data: question.options.map(
          (option) => ({
            questionId: record.id,

            key: option.key,

            text: option.text,

            isCorrect:
              option.correct,
          }),
        ),
      },
    );

    if (question.tags.length > 0) {
      await prisma.questionTag.createMany(
        {
          data: question.tags.map(
            (tag) => ({
              questionId:
                record.id,

              tag,
            }),
          ),
        },
      );
    }
  }

  console.log(
    `Seeded ${certification.code}: ${concepts.length} concepts, ${questions.length} questions`,
  );
}

async function main() {
  /*
   * IMPORTANT:
   *
   * Load and validate ALL content before
   * modifying the database.
   *
   * This prevents CLF from being inserted
   * successfully and then SAA failing halfway
   * through because of bad content.
   */

  const bundles =
    await loadAllSeedBundles();

  validateSeedBundles(bundles);

  /*
   * Only start DB mutations once every
   * certification has passed validation.
   */

  for (const bundle of bundles) {
    await seedBundle(bundle);
  }
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