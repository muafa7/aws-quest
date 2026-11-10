import { buttonClassName } from "@/components/arcade-button";
import { ArcadeIcon } from "@/components/arcade-icon";
import { AnswerList, OptionBreakdown } from "@/components/feedback";
import { MockRunner, type RunnerQuestion } from "@/components/mock-runner";
import { ProgressBar, percentOf } from "@/components/progress-bar";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { parseKeyList, parseOptionSnapshot } from "@/lib/learning/answers";
import { reviewOptions } from "@/lib/learning/feedback";
import { prisma } from "@/lib/prisma";

const reviewFilters = ["all", "missed", "flagged"] as const;
type ReviewFilter = (typeof reviewFilters)[number];

function timingNote(timeValidity: string | null) {
  if (timeValidity === "VALID") return "Submitted within the time limit (checked on the server).";
  if (timeValidity === "EXPIRED") return "Submitted after the time limit.";
  return "Taken before submit times were recorded.";
}

export default async function MockExamPage({ params, searchParams }: {
  params: Promise<{ certification: string; examId: string }>;
  searchParams: Promise<{ review?: string }>;
}) {
  const { certification: code, examId: rawId } = await params;
  const { review } = await searchParams;
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
              options: { orderBy: { key: "asc" }, select: { key: true, text: true, explanation: true } },
              concept: { include: { topic: true } },
            },
          },
        },
      },
    },
  });
  if (!exam) notFound();

  if (exam.status !== "COMPLETED") {
    // Only what is needed to answer: no correctness, explanations, or correct-answer snapshots.
    const questions: RunnerQuestion[] = exam.questions.map((item) => {
      const options = parseOptionSnapshot(item.optionsSnapshot) ?? item.question.options;
      const order = parseKeyList(item.optionOrderSnapshot) ?? options.map((option) => option.key);
      return {
        questionId: item.questionId,
        position: item.position,
        type: item.question.type,
        prompt: item.questionTextSnapshot ?? item.question.prompt,
        difficulty: item.question.difficulty,
        options: order.flatMap((key) => {
          const option = options.find((candidate) => candidate.key === key);
          return option ? [{ key: option.key, text: option.text }] : [];
        }),
        selected: parseKeyList(item.selectedDraftSnapshot) ?? [],
        flagged: item.flagged,
      };
    });
    return (
      <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--exam">
        <MockRunner examId={exam.id} certification={code} mode={exam.assessmentMode} startedAt={exam.startedAt.toISOString()} durationMinutes={exam.durationMinutes} questions={questions} />
      </main>
    );
  }

  const filter: ReviewFilter = reviewFilters.find((option) => option === review) ?? "all";
  const domains = new Map<string, { total: number; correct: number }>();
  const weak = new Map<string, { name: string; slug: string; misses: number }>();
  let unseenTotal = 0;
  let unseenCorrect = 0;
  for (const item of exam.questions) {
    const domain = item.question.concept.topic.name;
    const current = domains.get(domain) ?? { total: 0, correct: 0 };
    current.total += 1;
    if (item.isCorrect) current.correct += 1;
    domains.set(domain, current);
    if (item.wasUnseenAtStart) {
      unseenTotal += 1;
      if (item.isCorrect) unseenCorrect += 1;
    }
    if (!item.isCorrect) {
      const concept = item.question.concept;
      const entry = weak.get(concept.slug) ?? { name: concept.name, slug: concept.slug, misses: 0 };
      entry.misses += 1;
      weak.set(concept.slug, entry);
    }
  }
  const weakConcepts = [...weak.values()].sort((a, b) => b.misses - a.misses);
  const hasUnseenData = exam.questions.some((item) => item.wasUnseenAtStart !== null);
  const partial = exam.questionCount < exam.certification.examQuestionCount;
  const shown = exam.questions.filter((item) => filter === "all" || (filter === "missed" ? !item.isCorrect : item.flagged));
  const reviewHref = (option: ReviewFilter) => `/mock/${code}/${exam.id}?result=1${option === "all" ? "" : `&review=${option}`}#exam-review`;

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--exam">
      <RetroPanel accent className="session-hero">
        <Eyebrow>{exam.assessmentMode === "FRESH" ? `SEALED FRESH EXAM // ${exam.assessmentPackId}` : "BOSS EXAM RESULT"}{" // "}{code}</Eyebrow>
        <h1>Exam complete</h1>
        <div className="exam-score">
          <div><p className="exam-score__value">{percentOf(exam.correctCount, exam.questionCount)}<span>%</span></p><p className="exam-score__label">Internal practice score, not an AWS scaled score</p></div>
          <div className="exam-score__correct"><strong>{exam.correctCount} / {exam.questionCount}</strong><p>Correct</p></div>
        </div>
        <div className="exam-result__notes">
          <p>{timingNote(exam.timeValidity)}{partial ? ` Partial mock: ${exam.questionCount} of ${exam.certification.examQuestionCount} questions.` : ""}</p>
          <p>
            {exam.assessmentMode === "FRESH"
              ? "Every question came from a sealed pack never shown before, so this score measures first-sight performance."
              : hasUnseenData
                ? unseenTotal > 0
                  ? `Questions never answered before this exam: ${unseenCorrect}/${unseenTotal} correct (${percentOf(unseenCorrect, unseenTotal)}%). The rest were familiar, which inflates the overall score.`
                  : "Every question had been answered before, so this score reflects familiarity as much as readiness."
                : "This exam predates first-sight tracking."}
          </p>
        </div>
      </RetroPanel>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <RetroPanel tone="violet">
          <div className="panel-heading"><ArcadeIcon name="progress" /><h2>Domain analysis</h2></div>
          <div>{[...domains.entries()].map(([domain, value], index) => <div key={domain} className="domain-result" data-tone={domainTone(index)}><div className="domain-result__label"><span>{domain}</span><StatusBadge tone={value.correct === value.total ? "success" : "neutral"}>{value.correct}/{value.total}</StatusBadge></div><ProgressBar value={percentOf(value.correct, value.total)} label={domain} /></div>)}</div>
        </RetroPanel>
        <RetroPanel tone="coral">
          <div className="panel-heading"><ArcadeIcon name="learn" /><h2>Recommended review</h2></div>
          <div>{weakConcepts.length ? weakConcepts.slice(0, 10).map((concept) => <div key={concept.slug} className="log-row"><div className="log-row__top"><Link href={`/learn/${code}/${concept.slug}`} className="text-slate-300 hover:text-[var(--amber)]">{concept.name}</Link><span className="text-[var(--danger)]">{concept.misses} miss{concept.misses === 1 ? "" : "es"}</span></div></div>) : <p className="empty-plate text-[var(--success)]">No weak concepts in this run.</p>}</div>
          {weakConcepts.length ? <Link href={`/mistakes?certification=${code}&source=MOCK`} className={buttonClassName("secondary", "mt-5 w-full")}>All mock mistakes</Link> : null}
        </RetroPanel>
      </div>

      <section className="mt-10" id="exam-review" aria-labelledby="exam-review-title">
        <div className="section-heading"><div><Eyebrow>ANSWER REVIEW</Eyebrow><h2 id="exam-review-title">Every question</h2></div></div>
        <nav className="filter-group__chips mb-5" aria-label="Filter reviewed questions">
          {reviewFilters.map((option) => <Link key={option} href={reviewHref(option)} className="filter-chip" aria-current={filter === option ? "true" : undefined}>{option === "all" ? `All (${exam.questions.length})` : option === "missed" ? `Missed (${exam.questions.filter((item) => !item.isCorrect).length})` : `Flagged (${exam.questions.filter((item) => item.flagged).length})`}</Link>)}
        </nav>
        <div className="space-y-4">
          {shown.map((item) => {
            const rows = reviewOptions({ ...item, isCorrect: Boolean(item.isCorrect), confidence: null }, item.question.options);
            const unanswered = !rows.some((row) => row.selected);
            const concept = item.question.concept;
            return (
              <RetroPanel key={item.id} tone={item.isCorrect ? "success" : "danger"} className="review-item">
                <details>
                  <summary className="review-item__summary">
                    <span className="exam-question__number">Q{item.position}</span>
                    <span className="review-item__concept">{concept.name}</span>
                    <span className="status-badges">
                      {item.flagged ? <StatusBadge tone="warning">Flagged</StatusBadge> : null}
                      <StatusBadge tone={item.isCorrect ? "success" : "danger"}>{item.isCorrect ? "Correct" : unanswered ? "Unanswered" : "Missed"}</StatusBadge>
                    </span>
                  </summary>
                  <p className="mistake-card__prompt">{item.questionTextSnapshot ?? item.question.prompt}</p>
                  <div className="feedback-answer-grid">
                    <dl className="feedback-answer" data-tone={item.isCorrect ? "success" : "danger"}><dt>Your answer</dt><dd><AnswerList rows={rows.filter((row) => row.selected)} /></dd></dl>
                    {!item.isCorrect ? <dl className="feedback-answer" data-tone="success"><dt>Correct answer</dt><dd><AnswerList rows={rows.filter((row) => row.correct)} /></dd></dl> : null}
                  </div>
                  <div className="feedback-review"><h3>Concept Review</h3><p lang="id">{concept.generalExplanation}</p></div>
                  {concept.keyNote ? <div className="key-note mt-5"><p className="key-note__label">Key Note</p><p className="key-note__text" lang="id">{concept.keyNote}</p></div> : null}
                  <OptionBreakdown rows={rows} sourceUrl={item.question.sourceUrl ?? concept.referenceUrl} />
                </details>
              </RetroPanel>
            );
          })}
          {shown.length === 0 ? <p className="empty-plate">No {filter} questions in this exam.</p> : null}
        </div>
      </section>
    </main>
  );
}
