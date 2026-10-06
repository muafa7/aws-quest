import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
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
} from "./schema";

export const SEED_DIRECTORIES = ["clf-c02", "saa-c03"] as const;

export type SeedBundle = {
  directoryName: string;
  certification: CertificationSeed;
  topics: TopicSeed[];
  concepts: ConceptSeed[];
  lessons: LessonSeed[];
  questions: QuestionSeed[];
};

const seedRoot = path.dirname(fileURLToPath(import.meta.url));

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

/**
 * Used only for duplicate detection.
 *
 * This means:
 *
 * "What is Amazon S3?"
 * "what-is-amazon-s3"
 * "WHAT IS AMAZON S3"
 *
 * become comparable strings.
 */
function normalize(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

async function loadQuestions(
  directory: string,
): Promise<QuestionSeed[]> {
  const questionDir = path.join(directory, "questions");

  const files = (await readdir(questionDir))
    .filter((file) => file.endsWith(".json"))
    .sort();

  const result: QuestionSeed[] = [];

  for (const file of files) {
    const raw = await readJson<unknown[]>(
      path.join(questionDir, file),
    );

    result.push(
      ...raw.map((question) => questionSchema.parse(question)),
    );
  }

  return result;
}

export async function loadSeedBundle(
  directoryName: string,
): Promise<SeedBundle> {
  const directory = path.join(seedRoot, directoryName);

  const certification = certificationSchema.parse(
    await readJson<unknown>(
      path.join(directory, "certification.json"),
    ),
  );

  const topics = topicSchema.array().parse(
    await readJson<unknown>(
      path.join(directory, "topics.json"),
    ),
  );

  const concepts = conceptSchema.array().parse(
    await readJson<unknown>(
      path.join(directory, "concepts.json"),
    ),
  );

  const lessons = lessonSchema.array().parse(
    await readJson<unknown>(
      path.join(directory, "lessons.json"),
    ),
  );

  const questions = await loadQuestions(directory);

  return {
    directoryName,
    certification,
    topics,
    concepts,
    lessons,
    questions,
  };
}

export async function loadAllSeedBundles(): Promise<
  SeedBundle[]
> {
  return Promise.all(
    SEED_DIRECTORIES.map((directory) =>
      loadSeedBundle(directory),
    ),
  );
}

/**
 * Validate one certification independently.
 */
export function validateSeedBundle(
  bundle: SeedBundle,
): void {
  const {
    certification,
    topics,
    concepts,
    lessons,
    questions,
  } = bundle;

  /*
   * TOPICS
   */

  const topicSlugs = new Set<string>();
  const normalizedTopicSlugs = new Set<string>();

  for (const topic of topics) {
    const normalizedSlug = normalize(topic.slug);

    if (normalizedTopicSlugs.has(normalizedSlug)) {
      throw new Error(
        `${certification.code}: duplicate topic slug '${topic.slug}'`,
      );
    }

    normalizedTopicSlugs.add(normalizedSlug);
    topicSlugs.add(topic.slug);
  }

  /*
   * CONCEPTS
   */

  const conceptSlugs = new Set<string>();
  const normalizedConceptSlugs = new Set<string>();

  for (const concept of concepts) {
    const normalizedSlug = normalize(concept.slug);

    if (normalizedConceptSlugs.has(normalizedSlug)) {
      throw new Error(
        `${certification.code}: duplicate concept slug '${concept.slug}'`,
      );
    }

    normalizedConceptSlugs.add(normalizedSlug);
    conceptSlugs.add(concept.slug);

    if (!topicSlugs.has(concept.topic)) {
      throw new Error(
        `${certification.code}: unknown topic '${concept.topic}' for concept '${concept.slug}'`,
      );
    }
  }

  /*
   * LESSONS
   *
   * Prisma currently allows one lesson per concept.
   */

  const lessonConcepts = new Set<string>();

  for (const lesson of lessons) {
    if (!conceptSlugs.has(lesson.concept)) {
      throw new Error(
        `${certification.code}: unknown concept '${lesson.concept}' in lesson seed`,
      );
    }

    if (lessonConcepts.has(lesson.concept)) {
      throw new Error(
        `${certification.code}: multiple lessons found for concept '${lesson.concept}'`,
      );
    }

    lessonConcepts.add(lesson.concept);
  }

  /*
   * QUESTIONS
   */

  const questionCodes = new Set<string>();

  const questionTexts = new Map<
    string,
    string
  >();

  for (const question of questions) {
    /*
     * Code uniqueness
     */

    const normalizedCode = normalize(question.code);

    if (questionCodes.has(normalizedCode)) {
      throw new Error(
        `${certification.code}: duplicate question code '${question.code}'`,
      );
    }

    questionCodes.add(normalizedCode);

    /*
     * Exact / formatting duplicate question detection.
     *
     * This catches duplicates even when punctuation,
     * capitalization, etc. differ slightly.
     */

    const normalizedQuestion = normalize(
      question.question,
    );

    const duplicateQuestionCode =
      questionTexts.get(normalizedQuestion);

    if (duplicateQuestionCode) {
      throw new Error(
        `${certification.code}: duplicate question text between '${duplicateQuestionCode}' and '${question.code}'`,
      );
    }

    questionTexts.set(
      normalizedQuestion,
      question.code,
    );

    /*
     * Concept reference
     */

    if (!conceptSlugs.has(question.concept)) {
      throw new Error(
        `${question.code}: unknown concept '${question.concept}'`,
      );
    }

    /*
     * Options
     */

    const optionKeys = new Set<string>();
    const optionTexts = new Set<string>();

    for (const option of question.options) {
      const normalizedKey = normalize(option.key);

      if (optionKeys.has(normalizedKey)) {
        throw new Error(
          `${question.code}: duplicate option key '${option.key}'`,
        );
      }

      optionKeys.add(normalizedKey);

      const normalizedOptionText = normalize(
        option.text,
      );

      if (
        optionTexts.has(normalizedOptionText)
      ) {
        throw new Error(
          `${question.code}: duplicate option text '${option.text}'`,
        );
      }

      optionTexts.add(normalizedOptionText);
    }

    /*
     * Tags
     */

    const tagNames = new Set<string>();

    for (const tag of question.tags) {
      const normalizedTag = normalize(tag);

      if (tagNames.has(normalizedTag)) {
        throw new Error(
          `${question.code}: duplicate tag '${tag}'`,
        );
      }

      tagNames.add(normalizedTag);
    }

    /*
     * Correct answer rules
     */

    const correctCount =
      question.options.filter(
        (option) => option.correct,
      ).length;

    if (
      question.type === "SINGLE_CHOICE" &&
      correctCount !== 1
    ) {
      throw new Error(
        `${question.code}: SINGLE_CHOICE requires exactly 1 correct option; found ${correctCount}`,
      );
    }

    if (
      question.type === "MULTIPLE_CHOICE" &&
      correctCount < 2
    ) {
      throw new Error(
        `${question.code}: MULTIPLE_CHOICE requires at least 2 correct options; found ${correctCount}`,
      );
    }
  }
}

/**
 * Validate conflicts across certifications.
 *
 * This is important because Concept.slug and Question.code
 * are globally unique in Prisma, not just unique inside
 * a certification.
 */
export function validateSeedBundles(
  bundles: SeedBundle[],
): void {
  /*
   * First make sure every bundle is independently valid.
   */
  for (const bundle of bundles) {
    validateSeedBundle(bundle);
  }

  const certificationCodes =
    new Set<string>();

  const conceptOwners = new Map<
    string,
    string
  >();

  const questionCodeOwners = new Map<
    string,
    string
  >();

  const questionTextOwners = new Map<
    string,
    string
  >();

  for (const bundle of bundles) {
    /*
     * Certification codes
     */

    const certificationCode = normalize(
      bundle.certification.code,
    );

    if (
      certificationCodes.has(
        certificationCode,
      )
    ) {
      throw new Error(
        `Duplicate certification code '${bundle.certification.code}'`,
      );
    }

    certificationCodes.add(
      certificationCode,
    );

    /*
     * Concept slugs
     */

    for (const concept of bundle.concepts) {
      const normalizedSlug = normalize(
        concept.slug,
      );

      const owner =
        conceptOwners.get(normalizedSlug);

      if (owner) {
        throw new Error(
          `Concept slug '${concept.slug}' is used by both ${owner} and ${bundle.certification.code}`,
        );
      }

      conceptOwners.set(
        normalizedSlug,
        bundle.certification.code,
      );
    }

    /*
     * Questions
     */

    for (const question of bundle.questions) {
      const normalizedCode = normalize(
        question.code,
      );

      const codeOwner =
        questionCodeOwners.get(
          normalizedCode,
        );

      if (codeOwner) {
        throw new Error(
          `Question code '${question.code}' is used by both ${codeOwner} and ${bundle.certification.code}`,
        );
      }

      questionCodeOwners.set(
        normalizedCode,
        bundle.certification.code,
      );

      /*
       * Prevent identical questions appearing
       * in CLF and SAA accidentally.
       */

      const normalizedQuestion = normalize(
        question.question,
      );

      const existingQuestionCode =
        questionTextOwners.get(
          normalizedQuestion,
        );

      if (existingQuestionCode) {
        throw new Error(
          `Duplicate question text found across certifications: '${existingQuestionCode}' and '${question.code}'`,
        );
      }

      questionTextOwners.set(
        normalizedQuestion,
        question.code,
      );
    }
  }
}