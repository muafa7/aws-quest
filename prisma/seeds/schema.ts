import { z } from "zod";

export const certificationSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  examQuestionCount: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  active: z.boolean().default(true),
});

export const topicSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  order: z.number().int().positive(),
  weight: z.number().min(0).max(1).optional(),
});

export const conceptSchema = z.object({
  topic: z.string().min(1),
  slug: z.string().min(1),
  name: z.string().min(1),
  generalExplanation: z.string().min(1),
  keyNote: z.string().optional(),
  referenceUrl: z.url().optional(),
  order: z.number().int().positive(),
  active: z.boolean().default(true),
});

export const lessonSchema = z.object({
  concept: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(1),
  order: z.number().int().positive().default(1),
});

export const questionSchema = z.object({
  code: z.string().min(1),
  concept: z.string().min(1),
  type: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE"]),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  style: z.enum(["BASIC", "UNDERSTANDING", "COMPARISON", "SCENARIO", "ARCHITECTURE"]),
  question: z.string().min(1),
  options: z.array(
    z.object({
      key: z.string().min(1),
      text: z.string().min(1),
      correct: z.boolean(),
    }),
  ).min(2),
  tags: z.array(z.string().min(1)).default([]),
  source: z.object({
    title: z.string().min(1),
    url: z.url(),
  }).optional(),
  active: z.boolean().default(true),
});

export type CertificationSeed = z.infer<typeof certificationSchema>;
export type TopicSeed = z.infer<typeof topicSchema>;
export type ConceptSeed = z.infer<typeof conceptSchema>;
export type LessonSeed = z.infer<typeof lessonSchema>;
export type QuestionSeed = z.infer<typeof questionSchema>;
