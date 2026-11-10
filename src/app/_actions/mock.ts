"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isValidSelection, parseKeyList, sameAnswers, shuffled, snapshotOptions } from "@/lib/learning/answers";
import { buildMockSelection, isWithinTime, packStatus, type ExposureTier } from "@/lib/learning/mock-selection";
import { trainingQuestionWhere } from "@/lib/learning/question-pools";

function requiredString(formData: FormData, key: string) {
  const value = formData.get(key);
  if (typeof value !== "string" || !value) throw new Error(`Missing form field: ${key}`);
  return value;
}

function parseId(formData: FormData, key: string) {
  const value = Number(requiredString(formData, key));
  if (!Number.isInteger(value) || value <= 0) throw new Error(`Invalid ${key}`);
  return value;
}

function stringValues(values: FormDataEntryValue[]) {
  return values.filter((value): value is string => typeof value === "string" && value.length > 0);
}

export async function startMockExam(formData: FormData) {
  const code = requiredString(formData, "certification");
  const fresh = formData.get("assessmentMode") === "FRESH";
  const packId = fresh ? requiredString(formData, "assessmentPackId") : null;
  const certification = await prisma.certification.findUnique({
    where: { code, active: true },
    include: { topics: { orderBy: { order: "asc" }, select: { id: true, weight: true } } },
  });
  if (!certification) throw new Error("Certification not found");

  const active = await prisma.mockExam.findFirst({ where: { certificationId: certification.id, status: "IN_PROGRESS" }, orderBy: { startedAt: "desc" } });
  if (active) redirect(`/mock/${code}/${active.id}`);

  const questions = await prisma.question.findMany({
    where: fresh
      ? { active: true, assessmentPackId: packId, concept: { topic: { certificationId: certification.id } } }
      : { ...trainingQuestionWhere, concept: { active: true, topic: { certificationId: certification.id } } },
    select: {
      id: true,
      prompt: true,
      concept: { select: { topicId: true } },
      options: { orderBy: { key: "asc" }, select: { key: true, text: true, explanation: true, isCorrect: true } },
    },
    orderBy: { code: "asc" },
  });
  const ids = questions.map((question) => question.id);
  const [answered, shownInMock] = await Promise.all([
    prisma.attempt.findMany({ where: { questionId: { in: ids } }, select: { questionId: true }, distinct: ["questionId"] }),
    prisma.mockExamQuestion.findMany({ where: { questionId: { in: ids } }, select: { questionId: true }, distinct: ["questionId"] }),
  ]);
  const inMock = new Set(shownInMock.map((row) => row.questionId));
  const inLearning = new Set(answered.map((row) => row.questionId));
  const exposure = (id: number): ExposureTier => (inMock.has(id) ? 2 : inLearning.has(id) ? 1 : 0);

  let selected: typeof questions;
  if (packId) {
    const used = await prisma.mockExam.findUnique({ where: { assessmentPackId: packId }, select: { id: true } });
    const status = packStatus({
      size: questions.length,
      examLength: certification.examQuestionCount,
      exposed: questions.filter((question) => exposure(question.id) > 0).length,
      usedByExamId: used?.id ?? null,
    });
    if (status.state === "USED") redirect(`/mock/${code}/${status.examId}`);
    if (status.state === "INCOMPLETE") throw new Error(`Assessment pack ${packId} has ${status.size} of ${certification.examQuestionCount} questions.`);
    if (status.state === "EXPOSED") throw new Error(`Assessment pack ${packId} has ${status.exposed} questions already shown in AWS Quest, so it is no longer a fresh assessment.`);
    selected = shuffled(questions);
  } else {
    const pools = certification.topics.map((topic) => ({
      topicId: topic.id,
      weight: topic.weight ?? 0,
      questions: questions.filter((question) => question.concept.topicId === topic.id),
    }));
    selected = buildMockSelection(pools, certification.examQuestionCount, exposure).map((item) => item.question);
    if (selected.length === 0) throw new Error("No training questions are available for this certification.");
  }

  let examId: number;
  try {
    const exam = await prisma.mockExam.create({
      data: {
        certificationId: certification.id,
        status: "IN_PROGRESS",
        activeKey: code,
        assessmentMode: fresh ? "FRESH" : "STANDARD",
        assessmentPackId: packId,
        durationMinutes: certification.durationMinutes,
        questionCount: selected.length,
        questions: {
          create: selected.map((question, index) => ({
            questionId: question.id,
            position: index + 1,
            correctOptionsSnapshot: JSON.stringify(question.options.filter((option) => option.isCorrect).map((option) => option.key).sort()),
            optionOrderSnapshot: JSON.stringify(shuffled(question.options.map((option) => option.key))),
            optionsSnapshot: snapshotOptions(question.options),
            questionTextSnapshot: question.prompt,
            wasUnseenAtStart: exposure(question.id) === 0,
          })),
        },
      },
    });
    examId = exam.id;
  } catch (error) {
    // A second tab started an exam, or used this pack, between the checks above and the insert.
    if ((error as { code?: string }).code !== "P2002") throw error;
    const winner = await prisma.mockExam.findFirst({ where: { OR: [{ activeKey: code }, ...(packId ? [{ assessmentPackId: packId }] : [])] } });
    if (!winner) throw error;
    examId = winner.id;
  }

  revalidatePath("/");
  revalidatePath(`/mock/${code}`);
  redirect(`/mock/${code}/${examId}`);
}

/** Autosave from the exam runner. Stores the learner's current choice only; nothing is graded here. */
export async function saveMockDraft(examId: number, questionId: number, selected: string[], flagged: boolean): Promise<{ saved: boolean; reason?: "closed" | "expired" }> {
  if (!Number.isSafeInteger(examId) || !Number.isSafeInteger(questionId) || !Array.isArray(selected) || !selected.every((key) => typeof key === "string") || typeof flagged !== "boolean") {
    throw new Error("Invalid exam draft");
  }
  const item = await prisma.mockExamQuestion.findUnique({
    where: { mockExamId_questionId: { mockExamId: examId, questionId } },
    include: {
      mockExam: { select: { status: true, startedAt: true, durationMinutes: true } },
      question: { select: { type: true, options: { select: { key: true } } } },
    },
  });
  if (!item) throw new Error("Question does not belong to this exam");
  if (item.mockExam.status !== "IN_PROGRESS") return { saved: false, reason: "closed" };
  if (!isWithinTime(item.mockExam.startedAt, item.mockExam.durationMinutes, new Date())) return { saved: false, reason: "expired" };
  if (selected.length > 0 && !isValidSelection(selected, item.question.options.map((option) => option.key), item.question.type)) {
    throw new Error("Invalid option selection");
  }
  await prisma.mockExamQuestion.update({ where: { id: item.id }, data: { selectedDraftSnapshot: JSON.stringify([...selected].sort()), flagged } });
  return { saved: true };
}

export async function submitMockExam(formData: FormData) {
  const code = requiredString(formData, "certification");
  const examId = parseId(formData, "examId");
  const resultHref = `/mock/${code}/${examId}?result=1`;

  const exam = await prisma.mockExam.findFirst({
    where: { id: examId, certification: { code } },
    include: { questions: { include: { question: { select: { type: true, options: { select: { key: true } } } } } } },
  });
  if (!exam) throw new Error("Mock exam not found");
  if (exam.status !== "IN_PROGRESS") redirect(resultHref);

  const finishedAt = new Date();
  // The runner posts every answer it holds. Any other submission falls back to the autosaved drafts.
  const fromRunner = formData.get("runner") === "1";
  let correctCount = 0;
  const graded = exam.questions.map((item) => {
    const selected = (fromRunner ? stringValues(formData.getAll(`question_${item.questionId}`)) : parseKeyList(item.selectedDraftSnapshot) ?? []).sort();
    if (selected.length > 0 && !isValidSelection(selected, item.question.options.map((option) => option.key), item.question.type)) {
      throw new Error(`Invalid answer for question ${item.position}`);
    }
    const correct = parseKeyList(item.correctOptionsSnapshot) ?? [];
    const isCorrect = correct.length > 0 && sameAnswers(selected, correct);
    if (isCorrect) correctCount += 1;
    return { id: item.id, selected, isCorrect };
  });

  const completed = await prisma.$transaction(async (tx) => {
    // Only the first submission wins; a second tab or a double click lands on the result.
    const changed = await tx.mockExam.updateMany({
      where: { id: examId, status: "IN_PROGRESS" },
      data: {
        status: "COMPLETED",
        activeKey: null,
        endedAt: finishedAt,
        correctCount,
        timeValidity: isWithinTime(exam.startedAt, exam.durationMinutes, finishedAt) ? "VALID" : "EXPIRED",
      },
    });
    if (changed.count !== 1) return false;
    for (const item of graded) {
      await tx.mockExamQuestion.update({ where: { id: item.id }, data: { selectedOptionsSnapshot: JSON.stringify(item.selected), isCorrect: item.isCorrect } });
    }
    return true;
  });

  if (completed) {
    revalidatePath("/");
    revalidatePath(`/mock/${code}`);
    revalidatePath(`/progress/${code}`);
  }
  redirect(resultHref);
}
