import { prisma } from "@/lib/prisma";
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
              _count: { select: { questions: { where: trainingQuestionWhere } } },
            },
          },
        },
      },
    },
  });

  if (!certification) return null;

  const now = new Date();
  const concepts = certification.topics.flatMap((topic) =>
    topic.concepts.map((concept) => ({
      ...concept,
      topicName: topic.name,
      topicSlug: topic.slug,
      state: conceptState(concept.progress, concept._count.questions, now),
    })),
  );
  const mastered = concepts.filter((concept) => concept.state.status === "CLEARED").length;
  const introduced = concepts.filter((concept) => concept.state.started).length;
  const reviewDue = concepts.filter((concept) => concept.state.reviewDue).length;
  const smallBank = concepts.filter((concept) => concept.state.smallBank).length;
  const masteryPercent = concepts.length === 0 ? 0 : Math.round((mastered / concepts.length) * 100);
  const nextConcept = concepts.find((concept) => !concept.state.started && concept.lesson && concept._count.questions > 0) ?? null;

  return { certification, concepts, mastered, introduced, reviewDue, smallBank, masteryPercent, nextConcept };
}
