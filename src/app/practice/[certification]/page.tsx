import { ArcadeButton, buttonClassName } from "@/components/arcade-button";
import { ArcadeIcon } from "@/components/arcade-icon";
import { HudStats } from "@/components/hud-stats";
import { ProgressBar } from "@/components/progress-bar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { finishPracticeSession, startPracticeSession } from "@/app/_actions/learning";
import { AttemptFeedback } from "@/components/feedback";
import { QuestionForm } from "@/components/question-form";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { prisma } from "@/lib/prisma";
import { selectPracticeQuestion } from "@/lib/learning/selector";

export default async function PracticeCertificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ certification: string }>;
  searchParams: Promise<{ session?: string; attempt?: string; checkpoint?: string }>;
}) {
  const { certification: code } = await params;
  const query = await searchParams;
  const certification = await prisma.certification.findUnique({ where: { code, active: true } });
  if (!certification) notFound();

  const sessionId = Number(query.session);
  if (!Number.isInteger(sessionId)) {
    return (
      <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
        <RetroPanel accent tone="teal" className="session-hero">
          <div className="session-hero__icon"><ArcadeIcon name="practice" width={28} height={28} /></div>
          <Eyebrow>PRACTICE // {code}</Eyebrow>
          <h1>Unlimited adaptive session</h1>
          <p className="session-hero__description">No fixed daily limit. A checkpoint appears every 10 questions, but you decide when the session ends.</p>
          <form action={startPracticeSession} className="mt-8">
            <input type="hidden" name="certification" value={code} />
            <ArcadeButton className="w-full">Start practice <ArcadeIcon name="arrow" width={18} height={18} /></ArcadeButton>
          </form>
        </RetroPanel>
      </main>
    );
  }

  const session = await prisma.practiceSession.findFirst({
    where: { id: sessionId, certificationId: certification.id },
  });
  if (!session) notFound();

  if (session.endedAt) {
    return (
      <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
        <RetroPanel accent tone="teal" className="session-hero">
          <div className="session-hero__icon"><ArcadeIcon name="check" width={28} height={28} /></div>
          <Eyebrow>SESSION COMPLETE</Eyebrow>
          <h1>{session.correctCount} / {session.questionCount} correct</h1>
          <Link href={`/progress/${code}`} className={buttonClassName("primary", "mt-8 w-full")}>View progress <ArcadeIcon name="arrow" width={18} height={18} /></Link>
        </RetroPanel>
      </main>
    );
  }

  const attemptId = Number(query.attempt);
  if (Number.isInteger(attemptId)) {
    const attempt = await prisma.attempt.findFirst({
      where: { id: attemptId, practiceSessionId: session.id },
      include: { question: { include: { concept: true, options: { select: { key: true, text: true }, orderBy: { key: "asc" } } } } },
    });
    if (attempt) {
      return (
        <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
          <header className="session-hud"><div><Eyebrow>PRACTICE // Q{session.questionCount}</Eyebrow><h1>Answer feedback</h1></div><StatusBadge>{session.correctCount}/{session.questionCount} CORRECT</StatusBadge></header>
          <AttemptFeedback attempt={attempt} options={attempt.question.options} explanation={attempt.question.concept.generalExplanation} keyNote={attempt.question.concept.keyNote} />
          <Link href={`/practice/${code}?session=${session.id}`} className={buttonClassName("primary", "mt-5 w-full")}>Continue <ArcadeIcon name="arrow" width={18} height={18} /></Link>
        </main>
      );
    }
  }

  const showCheckpoint = session.questionCount > 0 && session.questionCount % 10 === 0 && query.checkpoint !== String(session.questionCount);
  if (showCheckpoint) {
    const accuracy = session.questionCount ? Math.round((session.correctCount / session.questionCount) * 100) : 0;
    return (
      <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
        <RetroPanel accent className="session-hero">
          <div className="session-hero__icon"><ArcadeIcon name="progress" width={28} height={28} /></div>
          <Eyebrow>PRACTICE // {code}</Eyebrow>
          <h1>Session checkpoint</h1>
          <HudStats items={[
            { label: "Answered", value: session.questionCount },
            { label: "Correct", value: session.correctCount, tone: "success" },
            { label: "Accuracy", value: `${accuracy}%`, tone: "accent" },
          ]} />
          <ProgressBar value={accuracy} label="Session accuracy" />
          <div className="session-actions">
            <Link href={`/practice/${code}?session=${session.id}&checkpoint=${session.questionCount}`} className={buttonClassName()}>Continue <ArcadeIcon name="arrow" width={17} height={17} /></Link>
            <form action={finishPracticeSession}>
              <input type="hidden" name="certification" value={code} />
              <input type="hidden" name="sessionId" value={session.id} />
              <ArcadeButton variant="secondary" className="w-full">Finish session</ArcadeButton>
            </form>
          </div>
        </RetroPanel>
      </main>
    );
  }

  const question = await selectPracticeQuestion(code);
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
      <header className="session-hud">
        <div><Eyebrow>PRACTICE // {code}</Eyebrow><h1>Adaptive encounter</h1></div>
        <div className="session-hud__badges"><StatusBadge>{session.correctCount}/{session.questionCount} CORRECT</StatusBadge><StatusBadge>SESSION #{session.id}</StatusBadge></div>
      </header>
      {question ? (
        <RetroPanel accent>
          <div className="panel-heading"><ArcadeIcon name="practice" /><p className="panel-meta">Concept // {question.concept.name}</p></div>
          <QuestionForm question={question} certification={code} mode="PRACTICE" sessionId={session.id} />
        </RetroPanel>
      ) : <RetroPanel><p className="empty-plate">No active questions are available yet.</p></RetroPanel>}
      <form action={finishPracticeSession} className="mt-5 text-right">
        <input type="hidden" name="certification" value={code} />
        <input type="hidden" name="sessionId" value={session.id} />
        <ArcadeButton variant="quiet">Finish session</ArcadeButton>
      </form>
    </main>
  );
}
