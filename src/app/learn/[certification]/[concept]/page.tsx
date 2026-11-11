import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { buttonClassName } from "@/components/arcade-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { trainingQuestionWhere } from "@/lib/learning/question-pools";
import { getSafeQuestionById } from "@/lib/learning/selector";
import { AttemptFeedback } from "@/components/feedback";
import { QuestionForm } from "@/components/question-form";
import { RetroPanel } from "@/components/retro-panel";
import { ProgressBar, percentOf } from "@/components/progress-bar";
import { ClearMeter } from "@/components/concept-status";
import { conceptClearStatus } from "@/lib/learning/progress";

function seenSummary(seen: number, total: number) {
  if (seen < total) return `${seen} of ${total} challenges seen · ${total - seen} new left`;
  if (total === 1) return "1 of 1 challenge seen";
  return `All ${total} challenges seen. Another question repeats the one you answered longest ago.`;
}

export default async function LearnConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ certification: string; concept: string }>;
  searchParams: Promise<{ attempt?: string; recall?: string }>;
}) {
  const { certification, concept: conceptSlug } = await params;
  const { attempt: attemptParam, recall: recallParam } = await searchParams;
  const recall = recallParam === "1";

  const concept = await prisma.concept.findFirst({
    where: { slug: conceptSlug, topic: { certification: { code: certification } }, active: true },
    include: {
      lesson: true,
      questions: { where: trainingQuestionWhere, select: { id: true }, orderBy: { code: "asc" } },
      topic: { select: { name: true } },
    },
  });
  if (!concept?.lesson) notFound();

  const previousAttempts = await prisma.attempt.findMany({
    where: { question: { conceptId: concept.id }, mode: { in: ["LEARN", "PRACTICE"] } },
    select: { questionId: true, answeredAt: true },
    orderBy: { answeredAt: "asc" },
  });
  const lastAnswered = new Map(previousAttempts.map((attempt) => [attempt.questionId, attempt.answeredAt.getTime()]));
  // Unseen questions first; once all are seen, the one answered longest ago.
  const questionId =
    concept.questions.find((question) => !lastAnswered.has(question.id))?.id ??
    [...concept.questions].sort((a, b) => (lastAnswered.get(a.id) ?? 0) - (lastAnswered.get(b.id) ?? 0))[0]?.id;
  const question = questionId ? await getSafeQuestionById(questionId) : null;
  const total = concept.questions.length;
  const seen = concept.questions.filter((item) => lastAnswered.has(item.id)).length;
  const questionIsNew = questionId !== undefined && !lastAnswered.has(questionId);
  const { state, clear } = await conceptClearStatus(concept.id);
  const attemptId = Number(attemptParam);
  const attempt = Number.isInteger(attemptId)
    ? await prisma.attempt.findFirst({
        where: { id: attemptId, question: { conceptId: concept.id } },
        include: { question: { select: { sourceUrl: true, options: { select: { key: true, text: true, explanation: true }, orderBy: { key: "asc" } } } } },
      })
    : null;
  const keyPoints = JSON.parse(concept.lesson.keyPoints) as string[];

  // Presentation only: same sequence as the stage map (topic order, then concept order).
  const sequence = await prisma.concept.findMany({
    where: { active: true, lesson: { isNot: null }, topic: { certification: { code: certification } } },
    select: { slug: true, name: true },
    orderBy: [{ topic: { order: "asc" } }, { order: "asc" }],
  });
  const currentIndex = sequence.findIndex((item) => item.slug === concept.slug);
  const nextConcept = currentIndex >= 0 ? (sequence[currentIndex + 1] ?? null) : null;
  const conceptHref = `/learn/${certification}/${concept.slug}`;
  const lessonHidden = recall && !attempt;

  const lessonBody = (
    <>
      <div lang="id">
        <p className="lesson-summary">{concept.lesson.summary}</p>
        <div className="lesson-points">{keyPoints.map((point, index) => <div key={point} className="lesson-point"><span className="lesson-point__number">{String(index + 1).padStart(2, "0")}</span><p className="lesson-point__text">{point}</p></div>)}</div>
        {concept.keyNote ? <div className="key-note"><p className="key-note__label" lang="en">Key Note</p><p className="key-note__text">{concept.keyNote}</p></div> : null}
      </div>
      {concept.referenceUrl ? <a href={concept.referenceUrl} target="_blank" rel="noreferrer" aria-label="AWS reference (opens in a new tab)" className="text-link mt-4 underline underline-offset-4">AWS reference <ArcadeIcon name="external" width={15} height={15} /></a> : null}
    </>
  );

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--wide">
      <PageHeader eyebrow={<>{certification}{" // "}{concept.topic.name}</>} title={concept.lesson.title} icon="learn" action={<Link href={`/learn/${certification}`} className={buttonClassName("quiet")}><ArcadeIcon name="back" width={16} height={16} /> Stage map</Link>} />
      {currentIndex >= 0 ? (
        <div className="lesson-position">
          <ProgressBar compact tone="teal" value={percentOf(currentIndex + 1, sequence.length)} label={`Lesson ${currentIndex + 1} of ${sequence.length}`} valueText={concept.topic.name} />
          {nextConcept ? <p className="lesson-position__next">Up next: {nextConcept.name}</p> : <p className="lesson-position__next">This is the last lesson in {certification}.</p>}
        </div>
      ) : null}
      <div className="lesson-grid">
        <RetroPanel tone="teal">
          <div className="panel-heading">
            <ArcadeIcon name="learn" /><h2>Lesson</h2>
            <Link href={recall ? conceptHref : `${conceptHref}?recall=1`} className="text-link ml-auto">{recall ? "Show the lesson" : "Try from memory"}</Link>
          </div>
          {lessonHidden ? (
            <div className="recall-plate">
              <p>Answer from memory first. Pulling the idea out before re-reading is what makes it stick.</p>
              <details className="lesson-reveal"><summary>Stuck? Open the lesson</summary>{lessonBody}</details>
            </div>
          ) : lessonBody}
        </RetroPanel>
        <div id="challenge" className="min-w-0">
          {attempt ? (
            <div className="space-y-5">
              <AttemptFeedback attempt={attempt} options={attempt.question.options} explanation={concept.generalExplanation} keyNote={concept.keyNote} sourceUrl={attempt.question.sourceUrl ?? concept.referenceUrl} />
              <div className="challenge-status">
                <p className="challenge-status__seen">{seenSummary(seen, total)}</p>
                <ClearMeter state={state} clear={clear} />
              </div>
              {nextConcept || concept.questions.length > 1 ? (
                <div className="session-actions !mt-0">
                  {nextConcept ? <Link href={`/learn/${certification}/${nextConcept.slug}${recall ? "?recall=1" : ""}`} className={buttonClassName("primary")}>Next lesson <ArcadeIcon name="arrow" width={17} height={17} /></Link> : <Link href={`/learn/${certification}`} className={buttonClassName("primary")}>Back to stage map <ArcadeIcon name="arrow" width={17} height={17} /></Link>}
                  {concept.questions.length > 1 ? <Link href={`${conceptHref}${recall ? "?recall=1" : ""}#challenge`} className={buttonClassName("secondary")}>Another question</Link> : <Link href={`/learn/${certification}`} className={buttonClassName("secondary")}>Stage map</Link>}
                </div>
              ) : (
                <Link href={`/learn/${certification}`} className={buttonClassName("primary", "w-full")}>Back to stage map <ArcadeIcon name="arrow" width={17} height={17} /></Link>
              )}
            </div>
          ) : question ? (
            <RetroPanel accent>
              <div className="panel-heading"><ArcadeIcon name="practice" /><h2>{recall ? "Recall challenge" : "Challenge"}</h2><span className="panel-meta ml-auto">{questionIsNew ? `${seen + 1} of ${total}` : `Repeat · all ${total} seen`}</span></div>
              <QuestionForm question={question} certification={certification} conceptSlug={conceptSlug} mode="LEARN" recall={recall} />
              <div className="mt-5 grid gap-2">
                <ClearMeter state={state} clear={clear} />
                <p className="panel-meta">Learn answers schedule reviews but never clear a stage. Clearing happens in <Link href={`/practice/${certification}`} className="underline underline-offset-4 hover:text-[var(--amber)]">Practice</Link>, answered without the lesson.</p>
              </div>
            </RetroPanel>
          ) : (
            <RetroPanel><p className="empty-plate">No challenge has been seeded for this concept yet.</p></RetroPanel>
          )}
        </div>
      </div>
    </main>
  );
}
