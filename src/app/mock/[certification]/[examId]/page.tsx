import { ArcadeButton } from "@/components/arcade-button";
import { ArcadeIcon } from "@/components/arcade-icon";
import { ProgressBar } from "@/components/progress-bar";
import { domainTone } from "@/components/retro-panel";
import { notFound } from "next/navigation";
import { submitMockExam } from "@/app/_actions/mock";
import { ExamTimer } from "@/components/exam-timer";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { prisma } from "@/lib/prisma";

export default async function MockExamPage({ params }: { params: Promise<{ certification: string; examId: string }> }) {
  const { certification: code, examId: rawId } = await params;
  const examId = Number(rawId);
  if (!Number.isInteger(examId)) notFound();
  const exam = await prisma.mockExam.findFirst({
    where: { id: examId, certification: { code } },
    include: {
      certification: true,
      questions: {
        orderBy: { position: "asc" },
        include: {
          question: {
            include: {
              options: { orderBy: { key: "asc" } },
              concept: { include: { topic: true } },
            },
          },
        },
      },
    },
  });
  if (!exam) notFound();

  if (exam.status === "COMPLETED") {
    const percent = exam.questionCount ? Math.round((exam.correctCount / exam.questionCount) * 100) : 0;
    const domains = new Map<string, { total: number; correct: number }>();
    const weak = new Map<string, number>();
    for (const item of exam.questions) {
      const domain = item.question.concept.topic.name;
      const current = domains.get(domain) ?? { total: 0, correct: 0 };
      current.total += 1;
      if (item.isCorrect) current.correct += 1;
      domains.set(domain, current);
      if (!item.isCorrect) weak.set(item.question.concept.name, (weak.get(item.question.concept.name) ?? 0) + 1);
    }
    const weakConcepts = [...weak.entries()].sort((a, b) => b[1] - a[1]);

    return (
      <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--exam">
        <RetroPanel accent className="session-hero">
          <Eyebrow>BOSS EXAM RESULT // {code}</Eyebrow>
          <h1>Exam complete</h1>
          <div className="exam-score">
            <div><p className="exam-score__value">{percent}<span>%</span></p><p className="exam-score__label">Internal practice score</p></div>
            <div className="exam-score__correct"><strong>{exam.correctCount} / {exam.questionCount}</strong><p>Correct</p></div>
          </div>
        </RetroPanel>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <RetroPanel tone="violet">
            <div className="panel-heading"><ArcadeIcon name="progress" /><h2>Domain analysis</h2></div>
            <div>{[...domains.entries()].map(([domain, value], index) => <div key={domain} className="domain-result" data-tone={domainTone(index)}><div className="domain-result__label"><span>{domain}</span><StatusBadge tone={value.correct === value.total ? "success" : "neutral"}>{value.correct}/{value.total}</StatusBadge></div><ProgressBar value={value.total ? (value.correct / value.total) * 100 : 0} label={domain} /></div>)}</div>
          </RetroPanel>
          <RetroPanel tone="coral">
            <div className="panel-heading"><ArcadeIcon name="learn" /><h2>Recommended review</h2></div>
            <div>{weakConcepts.length ? weakConcepts.map(([concept, misses]) => <div key={concept} className="log-row"><div className="log-row__top"><span className="text-slate-300">{concept}</span><span className="text-[var(--danger)]">{misses} miss{misses === 1 ? "" : "es"}</span></div></div>) : <p className="empty-plate text-[var(--success)]">No weak concepts in this run.</p>}</div>
          </RetroPanel>
        </div>
      </main>
    );
  }

  const formId = `mock-exam-${exam.id}`;
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--exam">
      <header className="exam-hud">
        <div><h1 className="eyebrow">BOSS EXAM // {code}</h1><p className="exam-hud__description">{exam.questionCount} questions &middot; no feedback until submit</p></div>
        <div className="exam-hud__timer"><p>Time left</p><ExamTimer startedAt={exam.startedAt.toISOString()} durationMinutes={exam.durationMinutes} formId={formId} /></div>
      </header>
      <form id={formId} action={submitMockExam} className="space-y-6">
        <input type="hidden" name="certification" value={code} />
        <input type="hidden" name="examId" value={exam.id} />
        {exam.questions.map((item) => {
          const multiple = item.question.type === "MULTIPLE_CHOICE";
          return (
            <RetroPanel key={item.id}>
              <div className="exam-question__header"><p className="exam-question__number">QUESTION {item.position}</p><StatusBadge>{item.question.difficulty}</StatusBadge></div>
              <fieldset className="question-options">
                <legend className="question-prompt">{item.question.prompt}</legend>
                {item.question.options.map((option) => <label key={option.id} className="answer-option"><input type={multiple ? "checkbox" : "radio"} name={`question_${item.questionId}`} value={option.key} /><span className="answer-option__key">{option.key}</span><span className="answer-option__text">{option.text}</span></label>)}
              </fieldset>
            </RetroPanel>
          );
        })}
        <ArcadeButton className="w-full">Submit mock exam <ArcadeIcon name="arrow" width={18} height={18} /></ArcadeButton>
      </form>
    </main>
  );
}
