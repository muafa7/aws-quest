import Link from "next/link";
import { notFound } from "next/navigation";
import { certificationProgress } from "@/lib/learning/progress";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { ProgressBar } from "@/components/progress-bar";

export default async function LearnCertificationPage({ params }: { params: Promise<{ certification: string }> }) {
  const { certification: code } = await params;
  const data = await certificationProgress(code);
  if (!data) return notFound();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Eyebrow>CAMPAIGN // {data.certification.code}</Eyebrow>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h1 className="text-3xl font-black text-slate-100">{data.certification.name}</h1>
          <p className="mt-2 text-slate-400">Concept stages remain open. Learn in any order; review timing is handled separately.</p>
        </div>
        <div className="w-full max-w-xs"><ProgressBar value={data.masteryPercent} label="Campaign mastery" /></div>
      </div>

      <div className="mt-10 space-y-7">
        {data.certification.topics.map((topic, topicIndex) => (
          <section key={topic.id}>
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center border border-slate-600 text-xs font-black text-amber-300">{String(topicIndex + 1).padStart(2, "0")}</span>
              <h2 className="font-black text-slate-200">{topic.name}</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {topic.concepts.map((concept) => {
                const due = concept.progress?.nextReviewAt && concept.progress.nextReviewAt <= new Date();
                return (
                  <Link key={concept.id} href={`/learn/${data.certification.code}/${concept.slug}`}>
                    <RetroPanel className="h-full transition hover:border-amber-400/70">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500">Stage {String(concept.order).padStart(2, "0")}</p>
                          <h3 className="mt-2 font-bold text-slate-100">{concept.name}</h3>
                        </div>
                        {concept.progress?.masteredAt ? <StatusBadge tone="success">CLEARED</StatusBadge> : due ? <StatusBadge tone="danger">REVIEW DUE</StatusBadge> : concept.progress?.introducedAt ? <StatusBadge>IN PROGRESS</StatusBadge> : <StatusBadge>NEW</StatusBadge>}
                      </div>
                      <p className="mt-3 text-xs text-slate-500">{concept._count.questions} challenge{concept._count.questions === 1 ? "" : "s"}</p>
                    </RetroPanel>
                  </Link>
                );
              })}
              {topic.concepts.length === 0 ? <p className="border border-dashed border-slate-800 p-4 text-sm text-slate-600">Content not seeded for this area yet.</p> : null}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
