-- AlterTable
ALTER TABLE "Question" ADD COLUMN "assessmentPackId" TEXT;

-- AlterTable
ALTER TABLE "QuestionOption" ADD COLUMN "explanation" TEXT;

-- CreateIndex
CREATE INDEX "Question_assessmentPackId_idx" ON "Question"("assessmentPackId");
