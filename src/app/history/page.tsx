import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RetroPanel, StatusBadge } from "@/components/retro-panel";

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
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <PageHeader eyebrow="HISTORY LOG" title="Recent activity" icon="history" tone="teal" />
      <div className="history-grid">
        <RetroPanel>
          <div className="panel-heading"><ArcadeIcon name="history" /><h2>Answer log</h2></div>
          <div>
            {attempts.map((attempt) => (
              <div key={attempt.id} className="activity-row">
                <div className="activity-row__main"><p className="activity-row__title">{attempt.question.concept.name}</p><div className="flex flex-wrap gap-2"><StatusBadge tone={attempt.isCorrect ? "success" : "danger"}>{attempt.isCorrect ? "CORRECT" : "WRONG"}</StatusBadge>{attempt.confidence ? <StatusBadge>{attempt.confidence}</StatusBadge> : null}</div></div>
                <p className="activity-meta">{attempt.question.concept.topic.certification.code} &middot; {attempt.mode} &middot; {attempt.answeredAt.toLocaleString("en-GB")}</p>
              </div>
            ))}
            {attempts.length === 0 ? <div className="empty-plate"><ArcadeIcon name="history" width={28} height={28} /><p>No answers recorded yet.</p></div> : null}
          </div>
        </RetroPanel>
        <div className="space-y-6">
          <RetroPanel tone="teal">
            <div className="panel-heading"><ArcadeIcon name="practice" /><h2>Practice sessions</h2></div>
            <div>{sessions.map((session) => <div key={session.id} className="log-row"><div className="log-row__top"><span>{session.certification.code} #{session.id}</span><span className="text-[var(--teal)]">{session.correctCount}/{session.questionCount}</span></div><p className="activity-meta">{session.startedAt.toLocaleString("en-GB")}</p></div>)}</div>
            {sessions.length === 0 ? <p className="empty-plate">No practice sessions recorded yet.</p> : null}
          </RetroPanel>
          <RetroPanel tone="violet">
            <div className="panel-heading"><ArcadeIcon name="mock" /><h2>Mock exams</h2></div>
            <div>{exams.map((exam) => <Link key={exam.id} href={`/mock/${exam.certification.code}/${exam.id}`} className="log-row"><div className="log-row__top"><span>{exam.certification.code} #{exam.id}</span><span>{exam.status === "COMPLETED" ? `${exam.correctCount}/${exam.questionCount}` : "IN PROGRESS"}</span></div><p className="activity-meta">{exam.startedAt.toLocaleString("en-GB")}</p></Link>)}</div>
            {exams.length === 0 ? <p className="empty-plate">No mock exams recorded yet.</p> : null}
          </RetroPanel>
        </div>
      </div>
    </main>
  );
}
