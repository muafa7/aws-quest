import { prisma } from "@/lib/prisma";
import { confidencePriority } from "./review";
import type { Confidence, SafeQuestion } from "./types";

type Candidate = Awaited<ReturnType<typeof loadCandidates>>[number];
type RecentAttempt = {
  questionId: number;
  isCorrect: boolean;
  confidence: string | null;
  answeredAt: Date;
  question: { conceptId: number };
};

async function loadCandidates(certificationCode: string) {
  return prisma.concept.findMany({
    where: {
      active: true,
      topic: { certification: { code: certificationCode, active: true } },
      questions: { some: { active: true } },
    },
    include: {
      progress: true,
      topic: { select: { id: true, order: true, slug: true } },
      questions: {
        where: { active: true },
        include: { options: { orderBy: { key: "asc" } } },
        orderBy: { code: "asc" },
      },
    },
    orderBy: [{ topic: { order: "asc" } }, { order: "asc" }],
  });
}

function conceptAccuracy(candidate: Candidate) {
  const progress = candidate.progress;
  if (!progress || progress.totalAttempts === 0) return null;
  return progress.correctAttempts / progress.totalAttempts;
}

function conceptPriority(
  candidate: Candidate,
  now: Date,
  latestForConcept: RecentAttempt | undefined,
  isImmediatelyRecentConcept: boolean,
) {
  let score = 0;
  const progress = candidate.progress;
  const accuracy = conceptAccuracy(candidate);

  if (!progress || progress.totalAttempts === 0) score += 3;
  if (progress?.nextReviewAt && progress.nextReviewAt <= now) score += 6;
  if (accuracy !== null && accuracy < 0.7) score += 5;
  if (progress?.masteredAt) score -= 5;

  if (latestForConcept?.confidence && ["LOW", "MEDIUM", "HIGH"].includes(latestForConcept.confidence)) {
    score += confidencePriority(
      latestForConcept.isCorrect,
      latestForConcept.confidence as Confidence,
    );
  }

  if (isImmediatelyRecentConcept) score -= 3;
  return score;
}

function toSafeQuestion(question: Candidate["questions"][number], concept: Candidate): SafeQuestion {
  return {
    id: question.id,
    code: question.code,
    type: question.type,
    difficulty: question.difficulty,
    style: question.style,
    prompt: question.prompt,
    concept: {
      id: concept.id,
      slug: concept.slug,
      name: concept.name,
      generalExplanation: concept.generalExplanation,
      keyNote: concept.keyNote,
    },
    options: question.options.map((option) => ({ key: option.key, text: option.text })),
  };
}

export async function selectPracticeQuestion(certificationCode: string): Promise<SafeQuestion | null> {
  const candidates = await loadCandidates(certificationCode);
  if (candidates.length === 0) return null;

  const recentAttempts = await prisma.attempt.findMany({
    where: {
      mode: { in: ["LEARN", "PRACTICE"] },
      question: { concept: { topic: { certification: { code: certificationCode } } } },
    },
    select: {
      questionId: true,
      isCorrect: true,
      confidence: true,
      answeredAt: true,
      question: { select: { conceptId: true } },
    },
    orderBy: { answeredAt: "desc" },
    take: 100,
  });

  const latestByConcept = new Map<number, RecentAttempt>();
  for (const attempt of recentAttempts) {
    if (!latestByConcept.has(attempt.question.conceptId)) {
      latestByConcept.set(attempt.question.conceptId, attempt);
    }
  }

  const mostRecentConceptId = recentAttempts[0]?.question.conceptId;
  const now = new Date();
  const ranked = candidates
    .map((candidate) => ({
      candidate,
      score: conceptPriority(
        candidate,
        now,
        latestByConcept.get(candidate.id),
        mostRecentConceptId === candidate.id,
      ),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.candidate.topic.order - b.candidate.topic.order ||
        a.candidate.order - b.candidate.order,
    );

  const recentQuestionIds = new Set(recentAttempts.slice(0, 8).map((attempt) => attempt.questionId));
  const seenQuestionIds = new Set(recentAttempts.map((attempt) => attempt.questionId));

  for (const { candidate } of ranked) {
    const unused = candidate.questions.find((question) => !seenQuestionIds.has(question.id));
    if (unused) return toSafeQuestion(unused, candidate);

    const notRecent = candidate.questions.find((question) => !recentQuestionIds.has(question.id));
    if (notRecent) return toSafeQuestion(notRecent, candidate);
  }

  const fallback = ranked[0]?.candidate;
  if (!fallback?.questions[0]) return null;
  return toSafeQuestion(fallback.questions[0], fallback);
}

export async function getSafeQuestionById(questionId: number): Promise<SafeQuestion | null> {
  const question = await prisma.question.findUnique({
    where: { id: questionId, active: true },
    include: {
      options: { orderBy: { key: "asc" } },
      concept: true,
    },
  });

  if (!question) return null;

  return {
    id: question.id,
    code: question.code,
    type: question.type,
    difficulty: question.difficulty,
    style: question.style,
    prompt: question.prompt,
    concept: {
      id: question.concept.id,
      slug: question.concept.slug,
      name: question.concept.name,
      generalExplanation: question.concept.generalExplanation,
      keyNote: question.concept.keyNote,
    },
    options: question.options.map((option) => ({ key: option.key, text: option.text })),
  };
}
