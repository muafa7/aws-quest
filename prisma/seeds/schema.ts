import { z } from "zod";

const nonEmpty = z.string().trim().min(1);

export const certificationSchema = z.strictObject({
  code: nonEmpty,
  name: nonEmpty,
  examQuestionCount: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  active: z.boolean().default(true),
});

export const topicSchema = z.strictObject({
  slug: nonEmpty,
  name: nonEmpty,
  order: z.number().int().positive(),
  weight: z.number().min(0).max(1).optional(),
});

export const conceptSchema = z.strictObject({
  topic: nonEmpty,
  slug: nonEmpty,
  name: nonEmpty,
  generalExplanation: nonEmpty,
  keyNote: nonEmpty.optional(),
  referenceUrl: z.url().optional(),
  order: z.number().int().positive(),
  active: z.boolean().default(true),
});

export const lessonSchema = z.strictObject({
  concept: nonEmpty,
  title: nonEmpty,
  summary: nonEmpty,
  keyPoints: z.array(nonEmpty).min(1),
  order: z.number().int().positive().default(1),
});

export const questionSchema = z.strictObject({
  code: nonEmpty,
  concept: nonEmpty,
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  style: z.enum(["BASIC", "UNDERSTANDING", "COMPARISON", "SCENARIO", "ARCHITECTURE"]),
  question: nonEmpty,
  options: z.array(
    z.strictObject({
      key: nonEmpty,
      text: nonEmpty,
      correct: z.boolean(),
    }),
  ).min(2),
  tags: z.array(nonEmpty).default([]),
  source: z.strictObject({
    title: nonEmpty,
    url: z.url(),
  }).optional(),
  active: z.boolean().default(true),
});

export type CertificationSeed = z.infer<typeof certificationSchema>;
export type TopicSeed = z.infer<typeof topicSchema>;
export type ConceptSeed = z.infer<typeof conceptSchema>;
export type LessonSeed = z.infer<typeof lessonSchema>;
export type QuestionSeed = z.infer<typeof questionSchema>;
