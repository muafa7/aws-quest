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
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <RetroPanel accent>
          <Eyebrow>PRACTICE // {code}</Eyebrow>
          <h1 className="mt-3 text-3xl font-black text-slate-100">Unlimited adaptive session</h1>
          <p className="mt-4 leading-7 text-slate-400">No fixed daily limit. A checkpoint appears every 10 questions, but you decide when the session ends.</p>
          <form action={startPracticeSession} className="mt-7">
            <input type="hidden" name="certification" value={code} />
            <button className="w-full border border-amber-400 bg-amber-400 px-4 py-3 text-sm font-black tracking-[0.14em] text-slate-950 shadow-[4px_4px_0_#78350f]">START PRACTICE</button>
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
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <RetroPanel>
          <Eyebrow>SESSION COMPLETE</Eyebrow>
          <h1 className="mt-3 text-3xl font-black text-slate-100">{session.correctCount} / {session.questionCount} correct</h1>
          <Link href={`/progress/${code}`} className="mt-6 block border border-amber-400 bg-amber-400 px-4 py-3 text-center text-sm font-black text-slate-950">VIEW PROGRESS</Link>
        </RetroPanel>
      </main>
    );
  }

  const attemptId = Number(query.attempt);
  if (Number.isInteger(attemptId)) {
    const attempt = await prisma.attempt.findFirst({
      where: { id: attemptId, practiceSessionId: session.id },
      include: { question: { include: { concept: true } } },
    });
    if (attempt) {
      return (
        <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <Eyebrow>PRACTICE // Q{session.questionCount}</Eyebrow>
            <StatusBadge>{session.correctCount}/{session.questionCount} CORRECT</StatusBadge>
          </div>
          <AttemptFeedback attempt={attempt} explanation={attempt.question.concept.generalExplanation} keyNote={attempt.question.concept.keyNote} />
          <Link href={`/practice/${code}?session=${session.id}`} className="mt-4 block border border-amber-400 bg-amber-400 px-4 py-3 text-center text-sm font-black tracking-[0.14em] text-slate-950">CONTINUE</Link>
        </main>
      );
    }
  }

  const showCheckpoint = session.questionCount > 0 && session.questionCount % 10 === 0 && query.checkpoint !== String(session.questionCount);
  if (showCheckpoint) {
    const accuracy = session.questionCount ? Math.round((session.correctCount / session.questionCount) * 100) : 0;
    return (
      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <RetroPanel accent>
          <Eyebrow>SESSION CHECKPOINT</Eyebrow>
          <div className="mt-6 grid grid-cols-3 gap-3 text-center">
            <div className="border border-slate-700 bg-[#080d15] p-4"><strong className="block text-2xl text-slate-100">{session.questionCount}</strong><span className="text-[10px] uppercase text-slate-500">Answered</span></div>
            <div className="border border-slate-700 bg-[#080d15] p-4"><strong className="block text-2xl text-emerald-300">{session.correctCount}</strong><span className="text-[10px] uppercase text-slate-500">Correct</span></div>
            <div className="border border-slate-700 bg-[#080d15] p-4"><strong className="block text-2xl text-amber-300">{accuracy}%</strong><span className="text-[10px] uppercase text-slate-500">Accuracy</span></div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Link href={`/practice/${code}?session=${session.id}&checkpoint=${session.questionCount}`} className="border border-amber-400 bg-amber-400 px-4 py-3 text-center text-sm font-black text-slate-950">CONTINUE</Link>
            <form action={finishPracticeSession}>
              <input type="hidden" name="certification" value={code} />
              <input type="hidden" name="sessionId" value={session.id} />
              <button className="w-full border border-slate-600 px-4 py-3 text-sm font-bold text-slate-300 hover:border-amber-400">FINISH SESSION</button>
            </form>
          </div>
        </RetroPanel>
      </main>
    );
  }

  const question = await selectPracticeQuestion(code);
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Eyebrow>PRACTICE // {code}</Eyebrow>
          <h1 className="mt-2 text-xl font-black text-slate-100">Adaptive encounter</h1>
        </div>
        <div className="flex gap-2"><StatusBadge>{session.correctCount}/{session.questionCount} CORRECT</StatusBadge><StatusBadge>SESSION #{session.id}</StatusBadge></div>
      </div>
      {question ? (
        <RetroPanel accent>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Concept // {question.concept.name}</p>
          <QuestionForm question={question} certification={code} mode="PRACTICE" sessionId={session.id} />
        </RetroPanel>
      ) : (
        <RetroPanel><p className="text-slate-400">No active questions are available yet.</p></RetroPanel>
      )}
      <form action={finishPracticeSession} className="mt-4 text-right">
        <input type="hidden" name="certification" value={code} />
        <input type="hidden" name="sessionId" value={session.id} />
        <button className="text-xs font-bold tracking-[0.13em] text-slate-600 hover:text-red-300">FINISH SESSION</button>
      </form>
    </main>
  );
}
