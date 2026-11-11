import type { Prisma } from "../../../generated/prisma/client";

// Sealed assessment-pack questions must never reach Learn, Practice, or standard mocks.
// Every training query filters through this so a pack stays unseen until it is used as an exam.
export const trainingQuestionWhere = {
  active: true,
  assessmentPackId: null,
} satisfies Prisma.QuestionWhereInput;
