import { ArcadeButton, buttonClassName } from "@/components/arcade-button";
import { ArcadeIcon } from "@/components/arcade-icon";
import { HudStats } from "@/components/hud-stats";
import { ProgressBar, percentOf } from "@/components/progress-bar";
import Link from "next/link";
import { notFound } from "next/navigation";
import { finishPracticeSession, startPracticeSession } from "@/app/_actions/learning";
import { AttemptFeedback } from "@/components/feedback";
import { QuestionForm } from "@/components/question-form";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { ClearMeter } from "@/components/concept-status";
import { prisma } from "@/lib/prisma";
import { conceptClearStatus } from "@/lib/learning/progress";
import { selectPracticeQuestion } from "@/lib/learning/selector";

const CHECKPOINT_EVERY = 10;

function practiceOutcome(attempt: { isCorrect: boolean; confidence: string | null; answeredAt: Date }, masteredAt: Date | null) {
  if (masteredAt?.getTime() === attempt.answeredAt.getTime()) return "Concept cleared!";
  if (masteredAt) return "Concept stays cleared.";
  if (!attempt.isCorrect) return "Missed, so the clear streak starts over.";
  if (attempt.confidence === "LOW") return "Correct, but low-confidence answers don't count toward clearing.";
  return "Counts toward clearing.";
}

function StartForm({ code, fresh, label, variant }: { code: string; fresh?: boolean; label: string; variant?: "primary" | "secondary" }) {
  return (
    <form action={startPracticeSession}>
      <input type="hidden" name="certification" value={code} />
      {fresh ? <input type="hidden" name="fresh" value="1" /> : null}
      <ArcadeButton variant={variant} className="w-full">{label} <ArcadeIcon name="arrow" width={18} height={18} /></ArcadeButton>
    </form>
  );
}

async function SessionRecap({ code, session }: { code: string; session: { id: number; questionCount: number; correctCount: number; startedAt: Date; endedAt: Date | null } }) {
  const attempts = await prisma.attempt.findMany({
    where: { practiceSessionId: session.id },
    select: { id: true, isCorrect: true, confidence: true, questionTextSnapshot: true, question: { select: { concept: { select: { id: true, name: true, slug: true } } } } },
    orderBy: [{ answeredAt: "asc" }, { id: "asc" }],
  });
  const byConcept = new Map<number, { name: string; slug: string; total: number; correct: number }>();
  for (const attempt of attempts) {
    const { concept } = attempt.question;
    const entry = byConcept.get(concept.id) ?? { name: concept.name, slug: concept.slug, total: 0, correct: 0 };
    entry.total += 1;
    if (attempt.isCorrect) entry.correct += 1;
    byConcept.set(concept.id, entry);
  }
  const concepts = [...byConcept.values()].sort((a, b) => a.correct / a.total - b.correct / b.total || a.name.localeCompare(b.name));
  const misses = attempts.filter((attempt) => !attempt.isCorrect);
  const confidentMisses = misses.filter((attempt) => attempt.confidence === "HIGH").length;

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
      <RetroPanel accent tone="teal" className="session-hero">
        <div className="session-hero__icon"><ArcadeIcon name="check" width={28} height={28} /></div>
        <Eyebrow>SESSION #{session.id} COMPLETE // {code}</Eyebrow>
        <h1>{session.questionCount === 0 ? "No questions answered" : `${session.correctCount} / ${session.questionCount} correct`}</h1>
        {session.questionCount > 0 ? (
          <HudStats items={[
            { label: "Answered", value: session.questionCount },
            { label: "Accuracy", value: `${percentOf(session.correctCount, session.questionCount)}%`, tone: "accent" },
            { label: "Confident misses", value: confidentMisses, tone: confidentMisses > 0 ? undefined : "success" },
          ]} />
        ) : <p className="session-hero__description">This session ended before any answers were recorded.</p>}
        <div className="session-actions">
          <StartForm code={code} label="New session" />
          <Link href={`/progress/${code}`} className={buttonClassName("secondary")}>View progress</Link>
        </div>
      </RetroPanel>
      {concepts.length > 0 ? (
        <RetroPanel className="mt-6">
          <div className="panel-heading"><ArcadeIcon name="progress" /><h2>By concept</h2></div>
          {concepts.map((concept) => (
            <div key={concept.slug} className="domain-result">
              <div className="domain-result__label"><Link href={`/learn/${code}/${concept.slug}`} className="hover:text-[var(--amber)]">{concept.name}</Link><span>{concept.correct}/{concept.total}</span></div>
              <ProgressBar compact tone={concept.correct === concept.total ? "teal" : "amber"} value={percentOf(concept.correct, concept.total)} label={`${concept.name} session accuracy`} />
            </div>
          ))}
        </RetroPanel>
      ) : null}
      {misses.length > 0 ? (
        <RetroPanel tone="coral" className="mt-6">
          <div className="panel-heading"><ArcadeIcon name="review" /><h2>Missed this session</h2></div>
          {misses.map((attempt) => (
            <div key={attempt.id} className="log-row">
              <div className="log-row__top"><span className="activity-row__title">{attempt.question.concept.name}</span>{attempt.confidence === "HIGH" ? <StatusBadge tone="danger">Confident miss</StatusBadge> : attempt.confidence ? <StatusBadge>{attempt.confidence}</StatusBadge> : null}</div>
              <p className="recap-prompt">{attempt.questionTextSnapshot}</p>
            </div>
          ))}
          <Link href={`/mistakes?certification=${code}&session=${session.id}`} className={buttonClassName("primary", "mt-5 w-full")}>Review these mistakes <ArcadeIcon name="arrow" width={17} height={17} /></Link>
        </RetroPanel>
      ) : null}
    </main>
  );
}

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
    const open = await prisma.practiceSession.findFirst({ where: { certificationId: certification.id, endedAt: null }, orderBy: { startedAt: "desc" } });
    return (
      <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
        <RetroPanel accent tone="teal" className="session-hero">
          <div className="session-hero__icon"><ArcadeIcon name="practice" width={28} height={28} /></div>
          <Eyebrow>PRACTICE // {code}</Eyebrow>
          <h1>Unlimited adaptive session</h1>
          <p className="session-hero__description">No fixed daily limit. A checkpoint appears every 10 questions, but you decide when the session ends. Practice is answered from memory, and it is the only mode that can clear a concept.</p>
          {open && open.questionCount > 0 ? (
            <>
              <p className="session-hero__description">Session #{open.id} is still open with {open.correctCount}/{open.questionCount} correct, started {open.startedAt.toLocaleString("en-GB")}.</p>
              <div className="session-actions">
                <Link href={`/practice/${code}?session=${open.id}`} className={buttonClassName()}>Resume session <ArcadeIcon name="arrow" width={18} height={18} /></Link>
                <StartForm code={code} fresh label="Start fresh" variant="secondary" />
              </div>
            </>
          ) : (
            <div className="mt-8"><StartForm code={code} label="Start practice" /></div>
          )}
        </RetroPanel>
      </main>
    );
  }

  const session = await prisma.practiceSession.findFirst({
    where: { id: sessionId, certificationId: certification.id },
  });
  if (!session) notFound();

  if (session.endedAt) return <SessionRecap code={code} session={session} />;

  const attemptId = Number(query.attempt);
  if (Number.isInteger(attemptId)) {
    const attempt = await prisma.attempt.findFirst({
      where: { id: attemptId, practiceSessionId: session.id },
      include: { question: { include: { concept: true, options: { select: { key: true, text: true, explanation: true }, orderBy: { key: "asc" } } } } },
    });
    if (attempt) {
      const status = await conceptClearStatus(attempt.question.conceptId);
      return (
        <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
          <header className="session-hud"><div><Eyebrow>PRACTICE // Q{session.questionCount}</Eyebrow><h1>Answer feedback</h1></div><StatusBadge>{session.correctCount}/{session.questionCount} CORRECT</StatusBadge></header>
          <div className="challenge-status mb-5">
            <p className="challenge-status__lead">{practiceOutcome(attempt, status.progress?.masteredAt ?? null)}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2"><p className="panel-meta">Concept // {attempt.question.concept.name}</p><ClearMeter state={status.state} clear={status.clear} practice /></div>
          </div>
          <AttemptFeedback attempt={attempt} options={attempt.question.options} explanation={attempt.question.concept.generalExplanation} keyNote={attempt.question.concept.keyNote} sourceUrl={attempt.question.sourceUrl ?? attempt.question.concept.referenceUrl} />
          <Link href={`/practice/${code}?session=${session.id}`} className={buttonClassName("primary", "mt-5 w-full")}>Continue <ArcadeIcon name="arrow" width={18} height={18} /></Link>
        </main>
      );
    }
  }

  const showCheckpoint = session.questionCount > 0 && session.questionCount % CHECKPOINT_EVERY === 0 && query.checkpoint !== String(session.questionCount);
  if (showCheckpoint) {
    const accuracy = percentOf(session.correctCount, session.questionCount);
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
  const status = question ? await conceptClearStatus(question.concept.id) : null;
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
      <header className="session-hud">
        <div><Eyebrow>PRACTICE // {code}</Eyebrow><h1>Adaptive encounter</h1></div>
        <div className="session-hud__badges"><StatusBadge>{session.correctCount}/{session.questionCount} CORRECT</StatusBadge><StatusBadge>{CHECKPOINT_EVERY - (session.questionCount % CHECKPOINT_EVERY)} TO CHECKPOINT</StatusBadge><StatusBadge>SESSION #{session.id}</StatusBadge></div>
      </header>
      {question ? (
        <RetroPanel accent>
          <div className="panel-heading flex-wrap"><ArcadeIcon name="practice" /><p className="panel-meta">Concept // {question.concept.name}</p>{status ? <div className="ml-auto"><ClearMeter state={status.state} clear={status.clear} practice /></div> : null}</div>
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
