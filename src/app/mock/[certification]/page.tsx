import { ArcadeButton } from "@/components/arcade-button";
import { ArcadeIcon } from "@/components/arcade-icon";
import { HudStats } from "@/components/hud-stats";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startMockExam } from "@/app/_actions/mock";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { prisma } from "@/lib/prisma";

export default async function MockCertificationPage({ params }: { params: Promise<{ certification: string }> }) {
  const { certification: code } = await params;
  const certification = await prisma.certification.findUnique({
    where: { code, active: true },
    include: { _count: { select: { mockExams: true } } },
  });
  if (!certification) notFound();
  const availableQuestions = await prisma.question.count({ where: { active: true, concept: { topic: { certificationId: certification.id } } } });
  const recent = await prisma.mockExam.findMany({ where: { certificationId: certification.id }, orderBy: { startedAt: "desc" }, take: 5 });

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
      <RetroPanel accent tone="coral" className="session-hero">
        <div className="session-hero__icon"><ArcadeIcon name="mock" width={28} height={28} /></div>
        <Eyebrow>BOSS EXAM // {code}</Eyebrow>
        <h1>{certification.name}</h1>
        <HudStats items={[
          { label: "Questions now", value: Math.min(certification.examQuestionCount, availableQuestions) },
          { label: "Minutes", value: certification.durationMinutes, tone: "accent" },
          { label: "Target bank", value: certification.examQuestionCount },
        ]} />
        {availableQuestions < certification.examQuestionCount ? <p className="key-note text-sm leading-7 text-amber-100">Development content is still partial, so this exam uses all {availableQuestions} available question{availableQuestions === 1 ? "" : "s"}. It automatically grows toward {certification.examQuestionCount} as the seed bank is filled.</p> : null}
        <ul className="exam-rules"><li><ArcadeIcon name="check" width={17} height={17} />No immediate correctness feedback</li><li><ArcadeIcon name="check" width={17} height={17} />No confidence selection</li><li><ArcadeIcon name="clock" width={17} height={17} />Result appears after submit or timer expiry</li></ul>
        <form action={startMockExam} className="mt-8">
          <input type="hidden" name="certification" value={code} />
          <ArcadeButton disabled={availableQuestions === 0} className="w-full">Start mock exam <ArcadeIcon name="arrow" width={18} height={18} /></ArcadeButton>
        </form>
      </RetroPanel>
      {recent.length > 0 ? (
        <section className="mt-10">
          <div className="section-heading"><div><Eyebrow>RECENT RUNS</Eyebrow></div></div>
          <div className="space-y-3">{recent.map((exam) => <Link key={exam.id} href={`/mock/${code}/${exam.id}`} className="run-link"><span>Run #{exam.id} &middot; {exam.startedAt.toLocaleDateString("en-GB")}</span><StatusBadge tone={exam.status === "COMPLETED" ? "success" : "warning"}>{exam.status === "COMPLETED" ? `${exam.correctCount}/${exam.questionCount}` : "IN PROGRESS"}</StatusBadge></Link>)}</div>
        </section>
      ) : null}
    </main>
  );
}
