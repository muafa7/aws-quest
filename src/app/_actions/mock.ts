"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

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

function sorted(values: string[]) {
  return [...values].sort();
}

function sameAnswers(a: string[], b: string[]) {
  const aa = sorted(a);
  const bb = sorted(b);
  return aa.length === bb.length && aa.every((value, index) => value === bb[index]);
}

export async function startMockExam(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const certification = await prisma.certification.findUnique({
    where: { code: certificationCode },
    include: {
      topics: {
        orderBy: { order: "asc" },
        include: {
          concepts: {
            where: { active: true },
            include: {
              questions: {
                where: { active: true },
                select: { id: true, options: { where: { isCorrect: true }, select: { key: true } } },
              },
            },
          },
        },
      },
    },
  });
  if (!certification) throw new Error("Certification not found");

  const topicPools = certification.topics.map((topic) => ({
    topicId: topic.id,
    weight: topic.weight ?? 0,
    questions: topic.concepts.flatMap((concept) => concept.questions),
  }));
  const poolSize = topicPools.reduce((sum, topic) => sum + topic.questions.length, 0);
  if (poolSize === 0) throw new Error("No active questions are available for this certification.");

  const targetCount = Math.min(certification.examQuestionCount, poolSize);
  const selected: (typeof topicPools)[number]["questions"] = [];
  const used = new Set<number>();

  for (const topic of topicPools) {
    const quota = Math.min(
      topic.questions.length,
      Math.floor(targetCount * topic.weight),
    );
    for (const question of topic.questions.slice(0, quota)) {
      selected.push(question);
      used.add(question.id);
    }
  }

  if (selected.length < targetCount) {
    for (const topic of topicPools) {
      for (const question of topic.questions) {
        if (selected.length >= targetCount) break;
        if (used.has(question.id)) continue;
        selected.push(question);
        used.add(question.id);
      }
      if (selected.length >= targetCount) break;
    }
  }

  const exam = await prisma.mockExam.create({
    data: {
      certificationId: certification.id,
      status: "IN_PROGRESS",
      durationMinutes: certification.durationMinutes,
      questionCount: selected.length,
      questions: {
        create: selected.map((question, index) => ({
          questionId: question.id,
          position: index + 1,
          correctOptionsSnapshot: JSON.stringify(question.options.map((option) => option.key).sort()),
        })),
      },
    },
  });

  redirect(`/mock/${certificationCode}/${exam.id}`);
}

export async function submitMockExam(formData: FormData) {
  const certificationCode = requiredString(formData, "certification");
  const examId = parseId(formData, "examId");

  const exam = await prisma.mockExam.findUnique({
    where: { id: examId },
    include: { questions: { orderBy: { position: "asc" } } },
  });
  if (!exam || exam.status !== "IN_PROGRESS") throw new Error("Mock exam is not active.");

  let correctCount = 0;
  const updates = exam.questions.map((item) => {
    const selected = formData
      .getAll(`question_${item.questionId}`)
      .filter((value): value is string => typeof value === "string")
      .sort();
    const correct = JSON.parse(item.correctOptionsSnapshot) as string[];
    const isCorrect = sameAnswers(selected, correct);
    if (isCorrect) correctCount += 1;

    return prisma.mockExamQuestion.update({
      where: { id: item.id },
      data: {
        selectedOptionsSnapshot: JSON.stringify(selected),
        isCorrect,
      },
    });
  });

  await prisma.$transaction([
    ...updates,
    prisma.mockExam.update({
      where: { id: examId },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
        correctCount,
      },
    }),
  ]);

  revalidatePath(`/mock/${certificationCode}/${examId}`);
  revalidatePath(`/progress/${certificationCode}`);
  redirect(`/mock/${certificationCode}/${examId}?result=1`);
}
