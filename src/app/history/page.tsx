import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";

export const metadata = { title: "History" };

export default async function HistoryPage() {
  const [attempts, exams, sessions] = await Promise.all([
    prisma.attempt.findMany({
      orderBy: { answeredAt: "desc" },
      take: 30,
      include: { question: { include: { concept: { include: { topic: { include: { certification: true } } } } } } },
    }),
    prisma.mockExam.findMany({ orderBy: { startedAt: "desc" }, take: 10, include: { certification: true } }),
    prisma.practiceSession.findMany({ orderBy: { startedAt: "desc" }, take: 10, include: { certification: true } }),
  ]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Eyebrow>HISTORY LOG</Eyebrow>
      <h1 className="mt-3 text-3xl font-black text-slate-100">Recent activity</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <RetroPanel>
          <Eyebrow>ANSWER LOG</Eyebrow>
          <div className="mt-4 divide-y divide-slate-800">
            {attempts.map((attempt) => (
              <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-bold text-slate-200">{attempt.question.concept.name}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-slate-600">{attempt.question.concept.topic.certification.code} · {attempt.mode} · {attempt.answeredAt.toLocaleString("en-GB")}</p>
                </div>
                <div className="flex gap-2"><StatusBadge tone={attempt.isCorrect ? "success" : "danger"}>{attempt.isCorrect ? "CORRECT" : "WRONG"}</StatusBadge>{attempt.confidence ? <StatusBadge>{attempt.confidence}</StatusBadge> : null}</div>
              </div>
            ))}
            {attempts.length === 0 ? <p className="py-6 text-sm text-slate-500">No answers recorded yet.</p> : null}
          </div>
        </RetroPanel>
        <div className="space-y-6">
          <RetroPanel>
            <Eyebrow>PRACTICE SESSIONS</Eyebrow>
            <div className="mt-4 space-y-3">{sessions.map((session) => <div key={session.id} className="border-b border-slate-800 pb-3 text-sm"><div className="flex justify-between gap-3"><span className="text-slate-300">{session.certification.code} #{session.id}</span><span className="text-amber-300">{session.correctCount}/{session.questionCount}</span></div><p className="mt-1 text-[10px] text-slate-600">{session.startedAt.toLocaleString("en-GB")}</p></div>)}</div>
          </RetroPanel>
          <RetroPanel>
            <Eyebrow>MOCK EXAMS</Eyebrow>
            <div className="mt-4 space-y-3">{exams.map((exam) => <Link key={exam.id} href={`/mock/${exam.certification.code}/${exam.id}`} className="block border-b border-slate-800 pb-3 text-sm hover:text-amber-300"><div className="flex justify-between gap-3"><span>{exam.certification.code} #{exam.id}</span><span>{exam.status === "COMPLETED" ? `${exam.correctCount}/${exam.questionCount}` : "IN PROGRESS"}</span></div><p className="mt-1 text-[10px] text-slate-600">{exam.startedAt.toLocaleString("en-GB")}</p></Link>)}</div>
          </RetroPanel>
        </div>
      </div>
    </main>
  );
}
