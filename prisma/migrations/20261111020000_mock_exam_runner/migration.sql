-- AlterTable
ALTER TABLE "MockExam" ADD COLUMN "activeKey" TEXT;
ALTER TABLE "MockExam" ADD COLUMN "assessmentMode" TEXT NOT NULL DEFAULT 'STANDARD';
ALTER TABLE "MockExam" ADD COLUMN "assessmentPackId" TEXT;
ALTER TABLE "MockExam" ADD COLUMN "timeValidity" TEXT;

-- AlterTable
ALTER TABLE "MockExamQuestion" ADD COLUMN "optionOrderSnapshot" TEXT;
ALTER TABLE "MockExamQuestion" ADD COLUMN "optionsSnapshot" TEXT;
ALTER TABLE "MockExamQuestion" ADD COLUMN "questionTextSnapshot" TEXT;
ALTER TABLE "MockExamQuestion" ADD COLUMN "selectedDraftSnapshot" TEXT;
ALTER TABLE "MockExamQuestion" ADD COLUMN "flagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "MockExamQuestion" ADD COLUMN "wasUnseenAtStart" BOOLEAN;

-- CreateIndex
CREATE UNIQUE INDEX "MockExam_activeKey_key" ON "MockExam"("activeKey");

-- CreateIndex
CREATE UNIQUE INDEX "MockExam_assessmentPackId_key" ON "MockExam"("assessmentPackId");
