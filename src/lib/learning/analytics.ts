import { prisma } from "@/lib/prisma";
import { packStatus } from "./mock-selection";
import { trainingQuestionWhere } from "./question-pools";
import { answerEvidence, calculateReadiness, rankMisconceptions, READINESS_RULES, readinessNextStep } from "./readiness";

const DAY = 86_400_000;

export async function certificationReadiness(code: string, progress: { introduced: number; reviewDue: number }, now = new Date()) {
  const certification = await prisma.certification.findUnique({
    where: { code },
    include: { topics: { orderBy: { order: "asc" }, select: { id: true, name: true, slug: true } } },
  });
  if (!certification) return null;

  const inCertification = { concept: { topic: { certificationId: certification.id } } };
  const windowStart = new Date(now.getTime() - READINESS_RULES.windowDays * DAY);
  const freshWindowStart = new Date(now.getTime() - READINESS_RULES.freshWindowDays * DAY);
  const trainingWhere = { ...trainingQuestionWhere, concept: { active: true, topic: { certificationId: certification.id } } };
  const [trainingCount, unseenCount, mocks, attemptGroups, confidentMisses, packQuestions, packExams] = await Promise.all([
    prisma.question.count({ where: trainingWhere }),
    prisma.question.count({ where: { ...trainingWhere, attempts: { none: {} }, mockItems: { none: {} } } }),
    prisma.mockExam.findMany({
      where: { certificationId: certification.id, status: "COMPLETED", endedAt: { gte: freshWindowStart } },
      select: {
        id: true, assessmentMode: true, assessmentPackId: true, correctCount: true, questionCount: true, timeValidity: true, endedAt: true,
        questions: { select: { isCorrect: true, wasUnseenAtStart: true, question: { select: { concept: { select: { topicId: true } } } } } },
      },
    }),
    prisma.attempt.groupBy({ by: ["mode", "isFirstRecordedAttempt", "isCorrect"], where: { question: inCertification }, _count: { _all: true } }),
    prisma.attempt.findMany({
      where: { question: inCertification, isCorrect: false, confidence: "HIGH", answeredAt: { gte: windowStart } },
      select: { question: { select: { concept: { select: { id: true, name: true, slug: true } } } } },
    }),
    prisma.question.findMany({
      where: { active: true, assessmentPackId: { not: null }, ...inCertification },
      select: { assessmentPackId: true, _count: { select: { attempts: true, mockItems: true } } },
    }),
    prisma.mockExam.findMany({ where: { certificationId: certification.id, assessmentPackId: { not: null } }, select: { id: true, assessmentPackId: true } }),
  ]);

  const packs = new Map<string, { size: number; exposed: number }>();
  for (const question of packQuestions) {
    if (!question.assessmentPackId) continue;
    const entry = packs.get(question.assessmentPackId) ?? { size: 0, exposed: 0 };
    entry.size += 1;
    if (question._count.attempts + question._count.mockItems > 0) entry.exposed += 1;
    packs.set(question.assessmentPackId, entry);
  }
  const freshPackAvailable = [...packs.entries()].some(([pack, info]) => packStatus({
    size: info.size,
    examLength: certification.examQuestionCount,
    exposed: info.exposed,
    usedByExamId: packExams.find((exam) => exam.assessmentPackId === pack)?.id ?? null,
  }).state === "AVAILABLE");

  const bankSupportsFullMock = trainingCount >= certification.examQuestionCount;
  const readiness = calculateReadiness({
    mocks: mocks.flatMap((mock) => mock.endedAt ? [{
      id: mock.id,
      mode: mock.assessmentMode,
      packId: mock.assessmentPackId,
      correct: mock.correctCount,
      total: mock.questionCount,
      full: mock.questionCount === certification.examQuestionCount && mock.questions.length === mock.questionCount,
      onTime: mock.timeValidity === "VALID",
      endedAt: mock.endedAt,
      items: mock.questions.map((item) => ({ topicId: item.question.concept.topicId, isCorrect: item.isCorrect === true, wasUnseenAtStart: item.wasUnseenAtStart })),
    }] : []),
    domains: certification.topics.map((topic) => ({ topicId: topic.id, name: topic.name, slug: topic.slug })),
    introduced: progress.introduced,
    due: progress.reviewDue,
    freshPackAvailable,
    bankSupportsFullMock,
    now,
  });

  const evidence = answerEvidence(attemptGroups.map((group) => ({ mode: group.mode, isFirstRecordedAttempt: group.isFirstRecordedAttempt, isCorrect: group.isCorrect, count: group._count._all })));
  const misconceptions = rankMisconceptions(confidentMisses.map((miss) => miss.question.concept));
  const hasActivity = attemptGroups.length > 0 || mocks.length > 0;
  const nextStep = readinessNextStep(readiness, { code, hasActivity, bankSupportsFullMock, freshPackAvailable, misconceptions: confidentMisses.length });

  return {
    readiness,
    nextStep,
    evidence,
    misconceptions,
    misconceptionCount: confidentMisses.length,
    hasActivity,
    bankSupportsFullMock,
    trainingCount,
    unseenCount,
    examQuestionCount: certification.examQuestionCount,
    freshPackAvailable,
  };
}

export type CertificationReadiness = NonNullable<Awaited<ReturnType<typeof certificationReadiness>>>;
