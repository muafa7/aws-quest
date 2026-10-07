import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
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

const seedRoot = path.dirname(fileURLToPath(import.meta.url));
const certificationDirectories = ["clf-c02", "saa-c03"];
const legacyQuestionFile = "core.json";
const codePattern = /^([A-Z]{3})-([A-Z0-9]{2,5})-\d{3}$/;
const selectPattern = /\(Select [A-Z]+\.\)/;
const selectWords = ["TWO", "THREE", "FOUR", "FIVE", "SIX"];

export type LoadedQuestion = { file: string; question: QuestionSeed };

export type ContentBundle = {
  directory: string;
  certification: CertificationSeed;
  topics: TopicSeed[];
  concepts: ConceptSeed[];
  lessons: LessonSeed[];
  questions: LoadedQuestion[];
};

export class ContentValidationError extends Error {
  constructor(issues: string[]) {
    super(`${issues.length} content validation error${issues.length === 1 ? "" : "s"}:\n\n${issues.join("\n\n")}`);
    this.name = "ContentValidationError";
  }
}

function issue(location: string, message: string, subject?: string) {
  return `${subject ? `ERROR: ${subject} (${location})` : `ERROR: ${location}`}\n${message}`;
}

function assertNoIssues(issues: string[]) {
  if (issues.length > 0) throw new ContentValidationError(issues);
}

function duplicates(values: string[]) {
  const seen = new Set<string>();
  const repeated = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) repeated.add(value);
    seen.add(value);
  }
  return [...repeated];
}

function topicOfFile(file: string) {
  return file.slice(0, -".json".length).split(".")[0];
}

function stringField(value: unknown, key: string) {
  if (typeof value !== "object" || value === null) return undefined;
  const field = (value as Record<string, unknown>)[key];
  return typeof field === "string" ? field : undefined;
}

async function readJson(directory: string, ...segments: string[]) {
  const location = [directory, ...segments].join("/");
  const raw = await readFile(path.join(seedRoot, directory, ...segments), "utf8");
  try {
    return { location, value: JSON.parse(raw) as unknown };
  } catch (error) {
    throw new ContentValidationError([issue(location, `Invalid JSON: ${(error as Error).message}`)]);
  }
}

function parseItems<S extends z.ZodType>(
  schema: S,
  value: unknown,
  location: string,
  subjectKey: string,
  label: string,
  issues: string[],
): z.output<S>[] {
  if (!Array.isArray(value)) {
    issues.push(issue(location, "Expected a JSON array."));
    return [];
  }

  const items: z.output<S>[] = [];
  value.forEach((raw, index) => {
    const result = schema.safeParse(raw);
    if (result.success) {
      items.push(result.data);
    } else {
      issues.push(issue(location, z.prettifyError(result.error), stringField(raw, subjectKey) ?? `${label} #${index + 1}`));
    }
  });
  return items;
}

async function loadBundle(directory: string): Promise<ContentBundle> {
  const issues: string[] = [];

  const certificationFile = await readJson(directory, "certification.json");
  const certification = certificationSchema.safeParse(certificationFile.value);
  if (!certification.success) {
    throw new ContentValidationError([issue(certificationFile.location, z.prettifyError(certification.error))]);
  }

  const topicsFile = await readJson(directory, "topics.json");
  const topics = parseItems(topicSchema, topicsFile.value, topicsFile.location, "slug", "topic", issues);
  const conceptsFile = await readJson(directory, "concepts.json");
  const concepts = parseItems(conceptSchema, conceptsFile.value, conceptsFile.location, "slug", "concept", issues);
  const lessonsFile = await readJson(directory, "lessons.json");
  const lessons = parseItems(lessonSchema, lessonsFile.value, lessonsFile.location, "concept", "lesson", issues);

  const questions: LoadedQuestion[] = [];
  const files = (await readdir(path.join(seedRoot, directory, "questions"))).filter((file) => file.endsWith(".json")).sort();
  for (const file of files) {
    const questionFile = await readJson(directory, "questions", file);
    const parsed = parseItems(questionSchema, questionFile.value, questionFile.location, "code", "question", issues);
    questions.push(...parsed.map((question) => ({ file, question })));
  }

  assertNoIssues(issues);
  return { directory, certification: certification.data, topics, concepts, lessons, questions };
}

function validateBundle(bundle: ContentBundle, issues: string[]) {
  const { directory, certification, topics, concepts, lessons, questions } = bundle;
  const topicSlugs = new Set(topics.map((topic) => topic.slug));
  const conceptsBySlug = new Map(concepts.map((concept) => [concept.slug, concept]));
  const lessonConcepts = new Set(lessons.map((lesson) => lesson.concept));

  for (const slug of duplicates(topics.map((topic) => topic.slug))) {
    issues.push(issue(`${directory}/topics.json`, "Duplicate topic slug.", slug));
  }

  for (const slug of duplicates(concepts.map((concept) => concept.slug))) {
    issues.push(issue(`${directory}/concepts.json`, "Duplicate concept slug.", slug));
  }
  for (const concept of concepts) {
    if (!topicSlugs.has(concept.topic)) {
      issues.push(issue(`${directory}/concepts.json`, `Unknown topic '${concept.topic}'.`, concept.slug));
    }
    if (concept.active && !lessonConcepts.has(concept.slug)) {
      issues.push(issue(`${directory}/lessons.json`, "Active concept has no lesson. Learn returns 404 without one.", concept.slug));
    }
  }

  for (const slug of duplicates(lessons.map((lesson) => lesson.concept))) {
    issues.push(issue(`${directory}/lessons.json`, "More than one lesson for this concept.", slug));
  }
  for (const lesson of lessons) {
    if (!conceptsBySlug.has(lesson.concept)) {
      issues.push(issue(`${directory}/lessons.json`, `Unknown concept '${lesson.concept}'.`, lesson.title));
    }
  }

  for (const file of new Set(questions.map(({ file }) => file))) {
    if (file !== legacyQuestionFile && !topicSlugs.has(topicOfFile(file))) {
      issues.push(issue(
        `${directory}/questions/${file}`,
        `Question files must be named <topic-slug>.json or <topic-slug>.<part>.json; '${topicOfFile(file)}' is not a ${certification.code} topic.`,
      ));
    }
  }

  const codes = new Set<string>();
  const prefixOwners = new Map<string, { concept: string; code: string }>();
  const codesByCertificationPrefix = new Map<string, string[]>();

  for (const { file, question } of questions) {
    const report = (message: string) => issues.push(issue(`${directory}/questions/${file}`, message, question.code));

    if (codes.has(question.code)) report("Duplicate question code.");
    codes.add(question.code);

    const concept = conceptsBySlug.get(question.concept);
    if (!concept) report(`Unknown concept '${question.concept}'.`);

    const codeMatch = codePattern.exec(question.code);
    if (!codeMatch) {
      report("Question code must look like <CERT>-<PREFIX>-<NNN>, e.g. CCP-SRM-001.");
    } else {
      const [, certificationPrefix, conceptPrefix] = codeMatch;
      codesByCertificationPrefix.set(certificationPrefix, [...(codesByCertificationPrefix.get(certificationPrefix) ?? []), question.code]);

      const prefix = `${certificationPrefix}-${conceptPrefix}`;
      const owner = prefixOwners.get(prefix);
      if (!owner) {
        prefixOwners.set(prefix, { concept: question.concept, code: question.code });
      } else if (owner.concept !== question.concept) {
        report(`Code prefix ${prefix} belongs to '${owner.concept}' (${owner.code}); this question references '${question.concept}'.`);
      }
    }

    const fileTopic = topicOfFile(file);
    if (concept && file !== legacyQuestionFile && topicSlugs.has(fileTopic) && concept.topic !== fileTopic) {
      report(`Concept '${concept.slug}' belongs to topic '${concept.topic}', so this question belongs in ${concept.topic}.json, not ${file}.`);
    }

    for (const key of duplicates(question.options.map((option) => option.key))) {
      report(`Duplicate option key '${key}'.`);
    }
    for (const tag of duplicates(question.tags)) {
      report(`Duplicate tag '${tag}'.`);
    }

    const correctCount = question.options.filter((option) => option.correct).length;
    if (question.type === "SINGLE_CHOICE") {
      if (correctCount !== 1) report(`SINGLE_CHOICE requires exactly 1 correct answer.\nFound: ${correctCount}`);
      if (question.question.includes("(Select")) report("SINGLE_CHOICE prompt must not contain '(Select ...)'.");
    } else if (correctCount < 2) {
      report(`MULTIPLE_CHOICE requires at least 2 correct answers.\nFound: ${correctCount}`);
    } else {
      const expected = `(Select ${selectWords[correctCount - 2] ?? correctCount}.)`;
      if (!question.question.includes(expected)) {
        const found = selectPattern.exec(question.question)?.[0];
        report(`MULTIPLE_CHOICE prompt must include '${expected}' for ${correctCount} correct answers.${found ? `\nFound: '${found}'` : ""}`);
      }
    }
  }

  if (codesByCertificationPrefix.size > 1) {
    const groups = [...codesByCertificationPrefix].map(
      ([prefix, prefixCodes]) => `${prefix}: ${prefixCodes.length} (${prefixCodes.slice(0, 3).join(", ")}${prefixCodes.length > 3 ? ", ..." : ""})`,
    );
    issues.push(issue(`${directory}/questions`, `All question codes in one certification must share one certification prefix.\nFound:\n${groups.join("\n")}`));
  }
}

function validateAcrossBundles(bundles: ContentBundle[], issues: string[]) {
  const owners = {
    certification: new Map<string, string>(),
    concept: new Map<string, string>(),
    code: new Map<string, string>(),
    certificationPrefix: new Map<string, string>(),
  };

  for (const { directory, certification, concepts, questions } of bundles) {
    const claim = (map: Map<string, string>, key: string, location: string, label: string) => {
      const owner = map.get(key);
      if (!owner) map.set(key, directory);
      else if (owner !== directory) issues.push(issue(location, `${label} is already used by ${owner}.`, key));
    };

    claim(owners.certification, certification.code, `${directory}/certification.json`, "Certification code");
    for (const concept of concepts) {
      claim(owners.concept, concept.slug, `${directory}/concepts.json`, "Concept slug");
    }
    for (const { file, question } of questions) {
      const location = `${directory}/questions/${file}`;
      claim(owners.code, question.code, location, "Question code");
      const certificationPrefix = codePattern.exec(question.code)?.[1];
      if (certificationPrefix) {
        claim(owners.certificationPrefix, certificationPrefix, location, `Certification prefix ${certificationPrefix} in this code`);
      }
    }
  }
}

export async function loadAndValidateAll() {
  const bundles: ContentBundle[] = [];
  for (const directory of certificationDirectories) {
    bundles.push(await loadBundle(directory));
  }

  const issues: string[] = [];
  for (const bundle of bundles) validateBundle(bundle, issues);
  validateAcrossBundles(bundles, issues);
  assertNoIssues(issues);

  return bundles;
}

function countBy(values: string[], keys: readonly string[]) {
  return keys.map((key) => `${key} ${values.filter((value) => value === key).length}`).join(", ");
}

export function summarizeBundle({ certification, topics, concepts, lessons, questions }: ContentBundle) {
  const topicOrder = new Map(topics.map((topic) => [topic.slug, topic.order]));
  const activeConcepts = concepts
    .filter((concept) => concept.active)
    .sort((a, b) => (topicOrder.get(a.topic) ?? 0) - (topicOrder.get(b.topic) ?? 0) || a.order - b.order);
  const activeQuestions = questions.map(({ question }) => question).filter((question) => question.active);
  const questionCount = (slug: string) => activeQuestions.filter((question) => question.concept === slug).length;
  const width = Math.max(0, ...topics.map((topic) => topic.slug.length), ...activeConcepts.map((concept) => concept.slug.length)) + 2;

  const correctKeys = activeQuestions.flatMap((question) => question.options.filter((option) => option.correct).map((option) => option.key));
  const optionKeys = [...new Set(activeQuestions.flatMap((question) => question.options.map((option) => option.key)))].sort();
  const belowMastery = activeConcepts.filter((concept) => questionCount(concept.slug) < 3).map((concept) => concept.slug);
  const belowRecommended = activeConcepts.filter((concept) => questionCount(concept.slug) === 3).map((concept) => concept.slug);

  return [
    `${certification.code}: ${activeConcepts.length} active concepts, ${lessons.length} lessons, ${activeQuestions.length} active questions (${questions.length} total)`,
    "  Domains",
    ...[...topics]
      .sort((a, b) => a.order - b.order)
      .map((topic) => {
        const topicConcepts = activeConcepts.filter((concept) => concept.topic === topic.slug);
        const topicQuestions = topicConcepts.reduce((sum, concept) => sum + questionCount(concept.slug), 0);
        return `    ${topic.slug.padEnd(width)}${String(topicConcepts.length).padStart(3)} concepts${String(topicQuestions).padStart(5)} questions`;
      }),
    "  Active questions per concept",
    ...activeConcepts.map((concept) => `    ${concept.slug.padEnd(width)}${String(questionCount(concept.slug)).padStart(3)}`),
    `  Style        ${countBy(activeQuestions.map((question) => question.style), questionSchema.shape.style.options)}`,
    `  Difficulty   ${countBy(activeQuestions.map((question) => question.difficulty), questionSchema.shape.difficulty.options)}`,
    `  Type         ${countBy(activeQuestions.map((question) => question.type), questionSchema.shape.type.options)}`,
    `  Correct key  ${countBy(correctKeys, optionKeys)} (informational)`,
    ...(belowMastery.length > 0 ? [`  WARNING: fewer than 3 active questions, mastery not reachable: ${belowMastery.join(", ")}`] : []),
    ...(belowRecommended.length > 0 ? [`  WARNING: only 3 active questions, below the recommended minimum of 4: ${belowRecommended.join(", ")}`] : []),
  ];
}
