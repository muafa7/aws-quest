import { prisma } from "@/lib/prisma";
import { trainingQuestionWhere } from "./question-pools";

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
            include: { progress: true, _count: { select: { questions: { where: trainingQuestionWhere } } } },
          },
        },
      },
    },
  });

  if (!certification) return null;

  const concepts = certification.topics.flatMap((topic) =>
    topic.concepts.map((concept) => ({ ...concept, topicName: topic.name, topicSlug: topic.slug })),
  );
  const mastered = concepts.filter((concept) => concept.progress?.masteredAt).length;
  const introduced = concepts.filter((concept) => concept.progress?.introducedAt || (concept.progress?.totalAttempts ?? 0) > 0).length;
  const now = new Date();
  const reviewDue = concepts.filter((concept) => concept.progress?.nextReviewAt && concept.progress.nextReviewAt <= now).length;
  const masteryPercent = concepts.length === 0 ? 0 : Math.round((mastered / concepts.length) * 100);

  return { certification, concepts, mastered, introduced, reviewDue, masteryPercent };
}
