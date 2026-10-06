import Link from "next/link";
import { notFound } from "next/navigation";
import { certificationProgress } from "@/lib/learning/progress";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { ProgressBar } from "@/components/progress-bar";

function accuracy(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export default async function CertificationProgressPage({ params }: { params: Promise<{ certification: string }> }) {
  const { certification: code } = await params;
  const data = await certificationProgress(code);
  if (!data) return notFound();
  const now = new Date();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div><Eyebrow>PROGRESS // {code}</Eyebrow><h1 className="mt-3 text-3xl font-black text-slate-100">{data.certification.name}</h1></div>
        <div className="w-full max-w-xs"><ProgressBar value={data.masteryPercent} label="Overall mastery" /></div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
        <RetroPanel><strong className="text-2xl text-slate-100">{data.concepts.length}</strong><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">Concepts</p></RetroPanel>
        <RetroPanel><strong className="text-2xl text-slate-100">{data.introduced}</strong><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">Introduced</p></RetroPanel>
        <RetroPanel><strong className="text-2xl text-emerald-300">{data.mastered}</strong><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">Cleared</p></RetroPanel>
        <RetroPanel><strong className="text-2xl text-amber-300">{data.reviewDue}</strong><p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-slate-500">Review Due</p></RetroPanel>
      </div>

      <section className="mt-9">
        <Eyebrow>CONCEPT STATUS</Eyebrow>
        <div className="mt-3 overflow-x-auto border border-slate-700">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="bg-[#0d1420] text-[10px] uppercase tracking-[0.15em] text-slate-500">
              <tr><th className="p-3">Area / Concept</th><th className="p-3">Attempts</th><th className="p-3">Accuracy</th><th className="p-3">Review Stage</th><th className="p-3">Next Review</th><th className="p-3">State</th></tr>
            </thead>
            <tbody>
              {data.concepts.map((concept) => {
                const progress = concept.progress;
                const due = progress?.nextReviewAt && progress.nextReviewAt <= now;
                return (
                  <tr key={concept.id} className="border-t border-slate-800 bg-[#090f18]">
                    <td className="p-3"><Link className="font-bold text-slate-200 hover:text-amber-300" href={`/learn/${code}/${concept.slug}`}>{concept.name}</Link><span className="mt-1 block text-[10px] uppercase text-slate-600">{concept.topicName}</span></td>
                    <td className="p-3 text-slate-400">{progress?.totalAttempts ?? 0}</td>
                    <td className="p-3 text-slate-400">{accuracy(progress?.correctAttempts ?? 0, progress?.totalAttempts ?? 0)}%</td>
                    <td className="p-3 text-slate-400">{progress?.reviewStage ?? 0}</td>
                    <td className="p-3 text-slate-400">{progress?.nextReviewAt ? progress.nextReviewAt.toLocaleDateString("en-GB") : "—"}</td>
                    <td className="p-3">{progress?.masteredAt ? <StatusBadge tone="success">CLEARED</StatusBadge> : due ? <StatusBadge tone="danger">DUE</StatusBadge> : (progress?.totalAttempts ?? 0) > 0 ? <StatusBadge>TRAINING</StatusBadge> : <StatusBadge>NEW</StatusBadge>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
