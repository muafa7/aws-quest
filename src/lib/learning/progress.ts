import { prisma } from "@/lib/prisma";
import { challengeProgress } from "./mastery";
import { trainingQuestionWhere } from "./question-pools";
import { conceptState } from "./status";

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
    select: { questionId: true, question: { select: { conceptId: true } } },
  });
  const answeredByConcept = new Map<number, number[]>();
  for (const attempt of attempts) {
    const list = answeredByConcept.get(attempt.question.conceptId) ?? [];
    list.push(attempt.questionId);
    answeredByConcept.set(attempt.question.conceptId, list);
  }

  const now = new Date();
  const topics = certification.topics.map((topic) => ({
    ...topic,
    concepts: topic.concepts.map((concept) => {
      const clear = challengeProgress(concept.questions.map((question) => question.id), answeredByConcept.get(concept.id) ?? []);
      return { ...concept, state: conceptState(concept.progress, now, clear.cleared), clear };
    }),
  }));
  const concepts = topics.flatMap((topic) =>
    topic.concepts.map((concept) => ({ ...concept, topicName: topic.name, topicSlug: topic.slug })),
  );
  const mastered = concepts.filter((concept) => concept.state.status === "CLEARED").length;
  const introduced = concepts.filter((concept) => concept.state.started).length;
  const reviewDue = concepts.filter((concept) => concept.state.reviewDue).length;
  const masteryPercent = concepts.length === 0 ? 0 : Math.round((mastered / concepts.length) * 100);
  const nextConcept = concepts.find((concept) => !concept.state.started && concept.lesson && concept._count.questions > 0) ?? null;

  return { certification, topics, concepts, mastered, introduced, reviewDue, masteryPercent, nextConcept };
}

/** Challenge coverage for one concept, for the challenge screens. */
export async function conceptClearStatus(conceptId: number, now = new Date()) {
  const [progress, attempts, questions] = await Promise.all([
    prisma.conceptProgress.findUnique({ where: { conceptId } }),
    prisma.attempt.findMany({ where: { mode: { in: ["LEARN", "PRACTICE"] }, question: { conceptId, ...trainingQuestionWhere } }, select: { questionId: true } }),
    prisma.question.findMany({ where: { ...trainingQuestionWhere, conceptId }, select: { id: true } }),
  ]);
  const clear = challengeProgress(questions.map((question) => question.id), attempts.map((attempt) => attempt.questionId));
  return { progress, state: conceptState(progress, now, clear.cleared), clear };
}
