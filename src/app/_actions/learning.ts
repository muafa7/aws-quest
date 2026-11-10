"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isExactPermutation, isValidSelection, sameAnswers, snapshotOptions } from "@/lib/learning/answers";
import { meetsMastery } from "@/lib/learning/mastery";
import { trainingQuestionWhere } from "@/lib/learning/question-pools";
import { scheduleReview } from "@/lib/learning/review";
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

function stringValues(values: FormDataEntryValue[]) {
  return values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);
}

export async function startPracticeSession(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const certification = await prisma.certification.findUnique({ where: { code: certificationCode, active: true } });
  if (!certification) throw new Error("Certification not found");

  const open = await prisma.practiceSession.findFirst({
    where: { certificationId: certification.id, endedAt: null },
    orderBy: { startedAt: "desc" },
  });
  // Starting again resumes the open session unless a fresh one was explicitly requested.
  // An untouched open session is reused rather than closed as an empty record.
  if (open && (formData.get("fresh") !== "1" || open.questionCount === 0)) {
    redirect(`/practice/${certificationCode}?session=${open.id}`);
  }

  const session = await prisma.$transaction(async (tx) => {
    await tx.practiceSession.updateMany({ where: { certificationId: certification.id, endedAt: null }, data: { endedAt: new Date() } });
    return tx.practiceSession.create({ data: { certificationId: certification.id } });
  });

  revalidatePath("/");
  redirect(`/practice/${certificationCode}?session=${session.id}`);
}

export async function finishPracticeSession(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const sessionId = parseId(formData, "sessionId");

  await prisma.practiceSession.updateMany({
    where: { id: sessionId, certification: { code: certificationCode }, endedAt: null },
    data: { endedAt: new Date() },
  });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath(`/progress/${certificationCode}`);
  redirect(`/practice/${certificationCode}?session=${sessionId}`);
}

export async function submitLearningAnswer(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const questionId = parseId(formData, "questionId");
  const mode = requiredString(formData, "mode") as LearningMode;
  if (mode !== "LEARN" && mode !== "PRACTICE") throw new Error("Invalid learning mode");

  const confidence = parseConfidence(formData.get("confidence"));
  const selected = stringValues(formData.getAll("answer")).sort();
  const shownOrder = stringValues(formData.getAll("optionOrder"));
  const recall = formData.get("recall") === "1";

  const question = await prisma.question.findFirst({
    where: { id: questionId, ...trainingQuestionWhere, concept: { topic: { certification: { code: certificationCode } } } },
    include: { options: { orderBy: { key: "asc" } }, concept: true },
  });
  if (!question) throw new Error("Question not found");

  const keys = question.options.map((option) => option.key);
  if (!isValidSelection(selected, keys, question.type)) throw new Error("Choose a valid answer before submitting.");
  // Forms rendered before shuffling existed send no order; they showed options in key order.
  if (shownOrder.length > 0 && !isExactPermutation(shownOrder, keys)) throw new Error("Invalid option order");
  const optionOrder = shownOrder.length > 0 ? shownOrder : keys;

  let practiceSessionId: number | null = null;
  if (mode === "PRACTICE") {
    practiceSessionId = parseId(formData, "sessionId");
    const session = await prisma.practiceSession.findFirst({
      where: { id: practiceSessionId, certification: { code: certificationCode } },
    });
    if (!session) throw new Error("Practice session not found");
    if (session.endedAt) redirect(`/practice/${certificationCode}?session=${session.id}`);
  }

  const correct = question.options.filter((option) => option.isCorrect).map((option) => option.key).sort();
  const isCorrect = sameAnswers(selected, correct);
  const now = new Date();

  const attempt = await prisma.$transaction(async (tx) => {
    const existing = await tx.conceptProgress.findUnique({ where: { conceptId: question.conceptId } });
    const { stage, nextReviewAt } = scheduleReview(existing?.reviewStage ?? 0, isCorrect, confidence, now, existing?.nextReviewAt ?? null);

    const created = await tx.attempt.create({
      data: {
        questionId,
        practiceSessionId,
        mode,
        confidence,
        isCorrect,
        questionTextSnapshot: question.prompt,
        selectedOptionsSnapshot: JSON.stringify(selected),
        correctOptionsSnapshot: JSON.stringify(correct),
        optionOrderSnapshot: JSON.stringify(optionOrder),
        optionsSnapshot: snapshotOptions(question.options),
      },
    });

    // Only Practice answers count toward clearing: Learn answers are made with the lesson open.
    const practiceAttempts = await tx.attempt.findMany({
      where: { mode: "PRACTICE", question: { conceptId: question.conceptId } },
      select: { questionId: true, isCorrect: true, confidence: true, answeredAt: true },
      orderBy: [{ answeredAt: "asc" }, { id: "asc" }],
    });
    const masteredAt = !isCorrect ? null : existing?.masteredAt ?? (mode === "PRACTICE" && meetsMastery(practiceAttempts) ? now : null);

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
        introducedAt: mode === "LEARN" ? now : null,
        lastReviewedAt: now,
        nextReviewAt,
        masteredAt,
      },
      update: {
        totalAttempts: { increment: 1 },
        correctAttempts: isCorrect ? { increment: 1 } : undefined,
        wrongAttempts: !isCorrect ? { increment: 1 } : undefined,
        lowConfidenceCount: confidence === "LOW" ? { increment: 1 } : undefined,
        mediumConfidenceCount: confidence === "MEDIUM" ? { increment: 1 } : undefined,
        highConfidenceCount: confidence === "HIGH" ? { increment: 1 } : undefined,
        reviewStage: stage,
        introducedAt: mode === "LEARN" && !existing?.introducedAt ? now : undefined,
        lastReviewedAt: now,
        nextReviewAt,
        masteredAt,
      },
    });

    if (practiceSessionId) {
      await tx.practiceSession.update({
        where: { id: practiceSessionId },
        data: { questionCount: { increment: 1 }, correctCount: isCorrect ? { increment: 1 } : undefined },
      });
    }

    return created;
  });

  revalidatePath("/");
  revalidatePath(`/progress/${certificationCode}`);

  if (mode === "PRACTICE") {
    redirect(`/practice/${certificationCode}?session=${practiceSessionId}&attempt=${attempt.id}`);
  }

  redirect(`/learn/${certificationCode}/${question.concept.slug}?attempt=${attempt.id}${recall ? "&recall=1" : ""}`);
}
