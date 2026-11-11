-- CreateTable
CREATE TABLE "Certification" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "examQuestionCount" INTEGER NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certificationId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "weight" REAL,
    CONSTRAINT "Topic_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "topicId" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "generalExplanation" TEXT NOT NULL,
    "keyNote" TEXT,
    "referenceUrl" TEXT,
    "order" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "Concept_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conceptId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "keyPoints" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "Lesson_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Question" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "conceptId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sourceTitle" TEXT,
    "sourceUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Question_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "tag" TEXT NOT NULL,
    CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PracticeSession" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certificationId" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "questionCount" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "PracticeSession_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attempt" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "questionId" INTEGER NOT NULL,
    "practiceSessionId" INTEGER,
    "mode" TEXT NOT NULL,
    "confidence" TEXT,
    "isCorrect" BOOLEAN NOT NULL,
    "questionTextSnapshot" TEXT NOT NULL,
    "selectedOptionsSnapshot" TEXT NOT NULL,
    "correctOptionsSnapshot" TEXT NOT NULL,
    "answeredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attempt_practiceSessionId_fkey" FOREIGN KEY ("practiceSessionId") REFERENCES "PracticeSession" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ConceptProgress" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "conceptId" INTEGER NOT NULL,
    "totalAttempts" INTEGER NOT NULL DEFAULT 0,
    "correctAttempts" INTEGER NOT NULL DEFAULT 0,
    "wrongAttempts" INTEGER NOT NULL DEFAULT 0,
    "lowConfidenceCount" INTEGER NOT NULL DEFAULT 0,
    "mediumConfidenceCount" INTEGER NOT NULL DEFAULT 0,
    "highConfidenceCount" INTEGER NOT NULL DEFAULT 0,
    "reviewStage" INTEGER NOT NULL DEFAULT 0,
    "introducedAt" DATETIME,
    "lastReviewedAt" DATETIME,
    "nextReviewAt" DATETIME,
    "masteredAt" DATETIME,
    CONSTRAINT "ConceptProgress_conceptId_fkey" FOREIGN KEY ("conceptId") REFERENCES "Concept" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockExam" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "certificationId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" DATETIME,
    "durationMinutes" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "MockExam_certificationId_fkey" FOREIGN KEY ("certificationId") REFERENCES "Certification" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MockExamQuestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "mockExamId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "selectedOptionsSnapshot" TEXT,
    "correctOptionsSnapshot" TEXT NOT NULL,
    "isCorrect" BOOLEAN,
    CONSTRAINT "MockExamQuestion_mockExamId_fkey" FOREIGN KEY ("mockExamId") REFERENCES "MockExam" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MockExamQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Certification_code_key" ON "Certification"("code");

-- CreateIndex
CREATE INDEX "Topic_certificationId_order_idx" ON "Topic"("certificationId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_certificationId_slug_key" ON "Topic"("certificationId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "Concept_slug_key" ON "Concept"("slug");

-- CreateIndex
CREATE INDEX "Concept_topicId_order_idx" ON "Concept"("topicId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Lesson_conceptId_key" ON "Lesson"("conceptId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_code_key" ON "Question"("code");

-- CreateIndex
CREATE INDEX "Question_conceptId_active_idx" ON "Question"("conceptId", "active");

-- CreateIndex
CREATE INDEX "Question_difficulty_style_idx" ON "Question"("difficulty", "style");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_key_key" ON "QuestionOption"("questionId", "key");

-- CreateIndex
CREATE INDEX "QuestionTag_tag_idx" ON "QuestionTag"("tag");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionTag_questionId_tag_key" ON "QuestionTag"("questionId", "tag");

-- CreateIndex
CREATE INDEX "Attempt_questionId_answeredAt_idx" ON "Attempt"("questionId", "answeredAt");

-- CreateIndex
CREATE INDEX "Attempt_practiceSessionId_idx" ON "Attempt"("practiceSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "ConceptProgress_conceptId_key" ON "ConceptProgress"("conceptId");

-- CreateIndex
CREATE INDEX "MockExam_certificationId_startedAt_idx" ON "MockExam"("certificationId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "MockExamQuestion_mockExamId_position_key" ON "MockExamQuestion"("mockExamId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "MockExamQuestion_mockExamId_questionId_key" ON "MockExamQuestion"("mockExamId", "questionId");
