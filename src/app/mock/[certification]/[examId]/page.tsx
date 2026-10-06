import { notFound } from "next/navigation";
import { submitMockExam } from "@/app/_actions/mock";
import { ExamTimer } from "@/components/exam-timer";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { prisma } from "@/lib/prisma";

export default async function MockExamPage({ params }: { params: Promise<{ certification: string; examId: string }> }) {
  const { certification: code, examId: rawId } = await params;
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
              options: { orderBy: { key: "asc" } },
              concept: { include: { topic: true } },
            },
          },
        },
      },
    },
  });
  if (!exam) notFound();

  if (exam.status === "COMPLETED") {
    const percent = exam.questionCount ? Math.round((exam.correctCount / exam.questionCount) * 100) : 0;
    const domains = new Map<string, { total: number; correct: number }>();
    const weak = new Map<string, number>();
    for (const item of exam.questions) {
      const domain = item.question.concept.topic.name;
      const current = domains.get(domain) ?? { total: 0, correct: 0 };
      current.total += 1;
      if (item.isCorrect) current.correct += 1;
      domains.set(domain, current);
      if (!item.isCorrect) weak.set(item.question.concept.name, (weak.get(item.question.concept.name) ?? 0) + 1);
    }
    const weakConcepts = [...weak.entries()].sort((a, b) => b[1] - a[1]);

    return (
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <RetroPanel accent>
          <Eyebrow>BOSS EXAM RESULT // {code}</Eyebrow>
          <div className="mt-5 flex flex-wrap items-end justify-between gap-5">
            <div><p className="text-5xl font-black text-amber-300">{percent}%</p><p className="mt-2 text-slate-400">Internal practice score</p></div>
            <div className="text-right"><p className="text-2xl font-black text-slate-100">{exam.correctCount} / {exam.questionCount}</p><p className="text-xs uppercase tracking-[0.14em] text-slate-500">Correct</p></div>
          </div>
        </RetroPanel>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <RetroPanel>
            <Eyebrow>DOMAIN ANALYSIS</Eyebrow>
            <div className="mt-4 space-y-3">
              {[...domains.entries()].map(([domain, value]) => <div key={domain} className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3"><span className="text-sm text-slate-300">{domain}</span><StatusBadge tone={value.correct === value.total ? "success" : "neutral"}>{value.correct}/{value.total}</StatusBadge></div>)}
            </div>
          </RetroPanel>
          <RetroPanel>
            <Eyebrow>RECOMMENDED REVIEW</Eyebrow>
            <div className="mt-4 space-y-3">
              {weakConcepts.length ? weakConcepts.map(([concept, misses]) => <div key={concept} className="flex justify-between border-b border-slate-800 pb-3 text-sm"><span className="text-slate-300">{concept}</span><span className="text-red-300">{misses} miss{misses === 1 ? "" : "es"}</span></div>) : <p className="text-sm text-emerald-300">No weak concepts in this run.</p>}
            </div>
          </RetroPanel>
        </div>
      </main>
    );
  }

  const formId = `mock-exam-${exam.id}`;
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="sticky top-[69px] z-30 mb-5 flex items-center justify-between border border-slate-700 bg-[#0d1420]/95 p-3 backdrop-blur">
        <div><Eyebrow>BOSS EXAM // {code}</Eyebrow><p className="mt-1 text-xs text-slate-500">{exam.questionCount} questions · no feedback until submit</p></div>
        <div className="text-right"><p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Time left</p><ExamTimer startedAt={exam.startedAt.toISOString()} durationMinutes={exam.durationMinutes} formId={formId} /></div>
      </div>
      <form id={formId} action={submitMockExam} className="space-y-5">
        <input type="hidden" name="certification" value={code} />
        <input type="hidden" name="examId" value={exam.id} />
        {exam.questions.map((item) => {
          const multiple = item.question.type === "MULTIPLE_CHOICE";
          return (
            <RetroPanel key={item.id}>
              <div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-amber-300">QUESTION {item.position}</p><StatusBadge>{item.question.difficulty}</StatusBadge></div>
              <fieldset className="mt-4 space-y-3">
                <legend className="mb-4 text-base font-semibold leading-7 text-slate-100">{item.question.prompt}</legend>
                {item.question.options.map((option) => (
                  <label key={option.id} className="flex cursor-pointer gap-3 border border-slate-700 bg-[#080d15] p-3 hover:border-amber-500/60">
                    <input type={multiple ? "checkbox" : "radio"} name={`question_${item.questionId}`} value={option.key} className="mt-1 accent-amber-400" />
                    <span className="font-bold text-amber-300">{option.key}</span><span className="text-sm leading-6 text-slate-300">{option.text}</span>
                  </label>
                ))}
              </fieldset>
            </RetroPanel>
          );
        })}
        <button className="w-full border border-amber-400 bg-amber-400 px-4 py-4 text-sm font-black tracking-[0.14em] text-slate-950 shadow-[4px_4px_0_#78350f]">SUBMIT MOCK EXAM</button>
      </form>
    </main>
  );
}
