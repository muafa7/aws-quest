"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { nextReviewStage, reviewDateForStage } from "@/lib/learning/review";
import type { Confidence, LearningMode } from "@/lib/learning/types";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing form field: ${key}`);
  }
  return value;
}

function parseId(formData: FormData, key: string) {
  const value = Number(requiredString(formData, key));
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid ${key}`);
  return value;
}

function parseConfidence(value: FormDataEntryValue | null): Confidence {
  if (value === "LOW" || value === "MEDIUM" || value === "HIGH") return value;
  throw new Error("Confidence is required for regular learning attempts.");
}

function normalizeAnswers(values: FormDataEntryValue[]) {
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean)
    .sort();
}

function sameAnswers(a: string[], b: string[]) {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

async function calculateMastery(conceptId: number) {
  const attempts = await prisma.attempt.findMany({
    where: { question: { conceptId }, mode: { in: ["LEARN", "PRACTICE"] } },
    select: {
      questionId: true,
      isCorrect: true,
      confidence: true,
      answeredAt: true,
    },
    orderBy: { answeredAt: "asc" },
  });

  if (attempts.length < 3) return false;
  const distinctQuestions = new Set(attempts.map((attempt) => attempt.questionId));
  const distinctDates = new Set(attempts.map((attempt) => attempt.answeredAt.toISOString().slice(0, 10)));
  const recent = attempts.slice(-3);
  const recentAccuracy = recent.filter((attempt) => attempt.isCorrect).length / recent.length;
  const latestConfidence = recent.at(-1)?.confidence;

  return (
    distinctQuestions.size >= 3 &&
    distinctDates.size >= 2 &&
    recentAccuracy >= 0.8 &&
    (latestConfidence === "MEDIUM" || latestConfidence === "HIGH")
  );
}

export async function startPracticeSession(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const certification = await prisma.certification.findUnique({ where: { code: certificationCode } });
  if (!certification) throw new Error("Certification not found");

  const session = await prisma.practiceSession.create({
    data: { certificationId: certification.id },
  });

  redirect(`/practice/${certificationCode}?session=${session.id}`);
}

export async function finishPracticeSession(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const sessionId = parseId(formData, "sessionId");

  await prisma.practiceSession.update({
    where: { id: sessionId },
    data: { endedAt: new Date() },
  });

  revalidatePath(`/progress/${certificationCode}`);
  redirect(`/progress/${certificationCode}`);
}

export async function submitLearningAnswer(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const questionId = parseId(formData, "questionId");
  const mode = requiredString(formData, "mode") as LearningMode;
  if (mode !== "LEARN" && mode !== "PRACTICE") throw new Error("Invalid learning mode");

  const confidence = parseConfidence(formData.get("confidence"));
  const selected = normalizeAnswers(formData.getAll("answer"));
  if (selected.length === 0) throw new Error("Choose at least one answer before submitting.");

  const sessionRaw = formData.get("sessionId");
  const practiceSessionId = typeof sessionRaw === "string" && sessionRaw ? Number(sessionRaw) : null;
  const conceptSlug = typeof formData.get("conceptSlug") === "string" ? String(formData.get("conceptSlug")) : null;

  const question = await prisma.question.findUnique({
    where: { id: questionId, active: true },
    include: { options: true, concept: true },
  });
  if (!question) throw new Error("Question not found");

  const correct = question.options.filter((option) => option.isCorrect).map((option) => option.key).sort();
  const isCorrect = sameAnswers(selected, correct);
  const now = new Date();
  const existingProgress = await prisma.conceptProgress.findUnique({ where: { conceptId: question.conceptId } });
  const stage = nextReviewStage(existingProgress?.reviewStage ?? 0, isCorrect, confidence);

  const attempt = await prisma.$transaction(async (tx) => {
    const created = await tx.attempt.create({
      data: {
        questionId,
        practiceSessionId: mode === "PRACTICE" ? practiceSessionId : null,
        mode,
        confidence,
        isCorrect,
        questionTextSnapshot: question.prompt,
        selectedOptionsSnapshot: JSON.stringify(selected),
        correctOptionsSnapshot: JSON.stringify(correct),
      },
    });

    const confidenceField =
      confidence === "LOW"
        ? { lowConfidenceCount: { increment: 1 } }
        : confidence === "MEDIUM"
          ? { mediumConfidenceCount: { increment: 1 } }
          : { highConfidenceCount: { increment: 1 } };

    await tx.conceptProgress.upsert({
      where: { conceptId: question.conceptId },
      create: {
        conceptId: question.conceptId,
        totalAttempts: 1,
        correctAttempts: isCorrect ? 1 : 0,
        wrongAttempts: isCorrect ? 0 : 1,
        lowConfidenceCount: confidence === "LOW" ? 1 : 0,
        mediumConfidenceCount: confidence === "MEDIUM" ? 1 : 0,
        highConfidenceCount: confidence === "HIGH" ? 1 : 0,
        reviewStage: stage,
        introducedAt: mode === "LEARN" ? now : existingProgress?.introducedAt,
        lastReviewedAt: now,
        nextReviewAt: reviewDateForStage(stage, now),
      },
      update: {
        totalAttempts: { increment: 1 },
        correctAttempts: isCorrect ? { increment: 1 } : undefined,
        wrongAttempts: !isCorrect ? { increment: 1 } : undefined,
        ...confidenceField,
        reviewStage: stage,
        introducedAt: mode === "LEARN" && !existingProgress?.introducedAt ? now : undefined,
        lastReviewedAt: now,
        nextReviewAt: reviewDateForStage(stage, now),
      },
    });

    if (mode === "PRACTICE" && practiceSessionId) {
      await tx.practiceSession.update({
        where: { id: practiceSessionId },
        data: {
          questionCount: { increment: 1 },
          correctCount: isCorrect ? { increment: 1 } : undefined,
        },
      });
    }

    return created;
  });

  if (await calculateMastery(question.conceptId)) {
    await prisma.conceptProgress.update({
      where: { conceptId: question.conceptId },
      data: { masteredAt: existingProgress?.masteredAt ?? now },
    });
  }

  revalidatePath("/");
  revalidatePath(`/progress/${certificationCode}`);

  if (mode === "PRACTICE") {
    redirect(`/practice/${certificationCode}?session=${practiceSessionId ?? ""}&attempt=${attempt.id}`);
  }

  redirect(`/learn/${certificationCode}/${conceptSlug ?? question.concept.slug}?attempt=${attempt.id}`);
}
