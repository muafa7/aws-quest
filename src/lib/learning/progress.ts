import { prisma } from "@/lib/prisma";
import type { MasteryAttempt } from "./mastery";
import { trainingQuestionWhere } from "./question-pools";
import { conceptClear, conceptState } from "./status";

const masteryAttemptSelect = { questionId: true, isCorrect: true, confidence: true, answeredAt: true } as const;
const chronological = [{ answeredAt: "asc" as const }, { id: "asc" as const }];

export async function certificationProgress(code: string) {
  const certification = await prisma.certification.findUnique({
    where: { code },
    include: {
      topics: {
        orderBy: { order: "asc" },
        include: {
          concepts: {
            where: { active: true },
            orderBy: { order: "asc" },
            include: {
              progress: true,
              lesson: { select: { id: true } },
              questions: { where: trainingQuestionWhere, select: { id: true } },
              _count: { select: { questions: { where: trainingQuestionWhere } } },
            },
          },
        },
      },
    },
  });

  if (!certification) return null;

  const attempts = await prisma.attempt.findMany({
    where: { mode: { in: ["LEARN", "PRACTICE"] }, question: { concept: { topic: { certificationId: certification.id } } } },
    select: { ...masteryAttemptSelect, mode: true, question: { select: { conceptId: true } } },
    orderBy: chronological,
  });
  const answered = new Set(attempts.map((attempt) => attempt.questionId));
  const practiceByConcept = new Map<number, MasteryAttempt[]>();
  for (const attempt of attempts) {
    if (attempt.mode !== "PRACTICE") continue;
    const list = practiceByConcept.get(attempt.question.conceptId) ?? [];
    list.push(attempt);
    practiceByConcept.set(attempt.question.conceptId, list);
  }

  const now = new Date();
  const topics = certification.topics.map((topic) => ({
    ...topic,
    concepts: topic.concepts.map((concept) => ({
      ...concept,
      state: conceptState(concept.progress, concept._count.questions, now),
      clear: conceptClear(concept.progress, practiceByConcept.get(concept.id) ?? [], now),
      seen: concept.questions.filter((question) => answered.has(question.id)).length,
    })),
  }));
  const concepts = topics.flatMap((topic) =>
    topic.concepts.map((concept) => ({ ...concept, topicName: topic.name, topicSlug: topic.slug })),
  );
  const mastered = concepts.filter((concept) => concept.state.status === "CLEARED").length;
  const introduced = concepts.filter((concept) => concept.state.started).length;
  const reviewDue = concepts.filter((concept) => concept.state.reviewDue).length;
  const smallBank = concepts.filter((concept) => concept.state.smallBank).length;
  const masteryPercent = concepts.length === 0 ? 0 : Math.round((mastered / concepts.length) * 100);
  const nextConcept = concepts.find((concept) => !concept.state.started && concept.lesson && concept._count.questions > 0) ?? null;

  return { certification, topics, concepts, mastered, introduced, reviewDue, smallBank, masteryPercent, nextConcept };
}

/** Clear progress for one concept, for the challenge screens. */
export async function conceptClearStatus(conceptId: number, now = new Date()) {
  const [progress, practiceAttempts, trainingQuestions] = await Promise.all([
    prisma.conceptProgress.findUnique({ where: { conceptId } }),
    prisma.attempt.findMany({ where: { mode: "PRACTICE", question: { conceptId } }, select: masteryAttemptSelect, orderBy: chronological }),
    prisma.question.count({ where: { ...trainingQuestionWhere, conceptId } }),
  ]);
  return {
    progress,
    state: conceptState(progress, trainingQuestions, now),
    clear: conceptClear(progress, practiceAttempts, now),
  };
}
