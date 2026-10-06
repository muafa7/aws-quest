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
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <RetroPanel accent>
        <Eyebrow>BOSS EXAM // {code}</Eyebrow>
        <h1 className="mt-3 text-3xl font-black text-slate-100">{certification.name}</h1>
        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="border border-slate-700 bg-[#080d15] p-4"><strong className="block text-xl text-slate-100">{Math.min(certification.examQuestionCount, availableQuestions)}</strong><span className="text-[10px] uppercase text-slate-500">Questions now</span></div>
          <div className="border border-slate-700 bg-[#080d15] p-4"><strong className="block text-xl text-amber-300">{certification.durationMinutes}</strong><span className="text-[10px] uppercase text-slate-500">Minutes</span></div>
          <div className="border border-slate-700 bg-[#080d15] p-4"><strong className="block text-xl text-slate-100">{certification.examQuestionCount}</strong><span className="text-[10px] uppercase text-slate-500">Target bank</span></div>
        </div>
        {availableQuestions < certification.examQuestionCount ? <p className="mt-4 border border-amber-900/70 bg-amber-950/20 p-3 text-xs leading-5 text-amber-200">Development content is still partial, so this exam uses all {availableQuestions} available question{availableQuestions === 1 ? "" : "s"}. It automatically grows toward {certification.examQuestionCount} as the seed bank is filled.</p> : null}
        <ul className="mt-6 space-y-2 text-sm text-slate-400"><li>• No immediate correctness feedback</li><li>• No confidence selection</li><li>• Result appears after submit or timer expiry</li></ul>
        <form action={startMockExam} className="mt-7">
          <input type="hidden" name="certification" value={code} />
          <button disabled={availableQuestions === 0} className="w-full border border-amber-400 bg-amber-400 px-4 py-3 text-sm font-black tracking-[0.14em] text-slate-950 disabled:cursor-not-allowed disabled:opacity-40">START MOCK EXAM</button>
        </form>
      </RetroPanel>

      {recent.length > 0 ? (
        <section className="mt-8">
          <Eyebrow>RECENT RUNS</Eyebrow>
          <div className="mt-3 space-y-2">
            {recent.map((exam) => (
              <Link key={exam.id} href={`/mock/${code}/${exam.id}`} className="flex items-center justify-between border border-slate-800 bg-[#0d1420] p-4 hover:border-slate-600">
                <span className="text-sm text-slate-300">Run #{exam.id} · {exam.startedAt.toLocaleDateString("en-GB")}</span>
                <StatusBadge tone={exam.status === "COMPLETED" ? "success" : "warning"}>{exam.status === "COMPLETED" ? `${exam.correctCount}/${exam.questionCount}` : "IN PROGRESS"}</StatusBadge>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
