import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { buttonClassName } from "@/components/arcade-button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSafeQuestionById } from "@/lib/learning/selector";
import { AttemptFeedback } from "@/components/feedback";
import { QuestionForm } from "@/components/question-form";
import { RetroPanel } from "@/components/retro-panel";
import { ProgressBar, percentOf } from "@/components/progress-bar";

export default async function LearnConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ certification: string; concept: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { certification, concept: conceptSlug } = await params;
  const { attempt: attemptParam } = await searchParams;

  const concept = await prisma.concept.findFirst({
    where: { slug: conceptSlug, topic: { certification: { code: certification } }, active: true },
    include: {
      lesson: true,
      questions: { where: { active: true }, select: { id: true }, orderBy: { code: "asc" } },
      topic: { select: { name: true } },
    },
  });
  if (!concept?.lesson) notFound();

  const previousAttempts = await prisma.attempt.findMany({
    where: { question: { conceptId: concept.id }, mode: { in: ["LEARN", "PRACTICE"] } },
    select: { questionId: true },
  });
  const seen = new Set(previousAttempts.map((attempt) => attempt.questionId));
  const questionId = concept.questions.find((question) => !seen.has(question.id))?.id ?? concept.questions[0]?.id;
  const question = questionId ? await getSafeQuestionById(questionId) : null;
  const attemptId = Number(attemptParam);
  const attempt = Number.isInteger(attemptId)
    ? await prisma.attempt.findFirst({
        where: { id: attemptId, question: { conceptId: concept.id } },
        include: { question: { select: { options: { select: { key: true, text: true }, orderBy: { key: "asc" } } } } },
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
          <div className="panel-heading"><ArcadeIcon name="learn" /><h2>Lesson</h2></div>
          <div lang="id">
            <p className="lesson-summary">{concept.lesson.summary}</p>
            <div className="lesson-points">{keyPoints.map((point, index) => <div key={point} className="lesson-point"><span className="lesson-point__number">{String(index + 1).padStart(2, "0")}</span><p className="lesson-point__text">{point}</p></div>)}</div>
            {concept.keyNote ? <div className="key-note"><p className="key-note__label" lang="en">Key Note</p><p className="key-note__text">{concept.keyNote}</p></div> : null}
          </div>
          {concept.referenceUrl ? <a href={concept.referenceUrl} target="_blank" rel="noreferrer" aria-label="AWS reference (opens in a new tab)" className="text-link mt-4 underline underline-offset-4">AWS reference <ArcadeIcon name="external" width={15} height={15} /></a> : null}
        </RetroPanel>
        <div className="min-w-0">
          {attempt ? (
            <div className="space-y-5">
              <AttemptFeedback attempt={attempt} options={attempt.question.options} explanation={concept.generalExplanation} keyNote={concept.keyNote} />
              {nextConcept ? (
                <div className="session-actions !mt-0">
                  <Link href={`/learn/${certification}/${nextConcept.slug}`} className={buttonClassName("primary")}>Next lesson <ArcadeIcon name="arrow" width={17} height={17} /></Link>
                  <Link href={`/learn/${certification}`} className={buttonClassName("secondary")}>Stage map</Link>
                </div>
              ) : (
                <Link href={`/learn/${certification}`} className={buttonClassName("primary", "w-full")}>Back to stage map <ArcadeIcon name="arrow" width={17} height={17} /></Link>
              )}
            </div>
          ) : question ? (
            <RetroPanel accent>
              <div className="panel-heading"><ArcadeIcon name="practice" /><h2>Challenge</h2></div>
              <QuestionForm question={question} certification={certification} conceptSlug={conceptSlug} mode="LEARN" />
            </RetroPanel>
          ) : (
            <RetroPanel><p className="empty-plate">No challenge has been seeded for this concept yet.</p></RetroPanel>
          )}
        </div>
      </div>
    </main>
  );
}
