import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { certificationProgress } from "@/lib/learning/progress";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { ProgressBar } from "@/components/progress-bar";

export default async function HomePage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  const progress = await Promise.all(certifications.map((certification) => certificationProgress(certification.code)));

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <Eyebrow>PLAYER TERMINAL // READY</Eyebrow>
          <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] text-slate-50 sm:text-6xl">
            Learn AWS like a <span className="text-amber-300">retro developer RPG.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Short lessons. Immediate retrieval. Adaptive rematches. Serious certification practice underneath a game-like shell.
          </p>
        </div>
        <RetroPanel className="text-sm">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">System objective</p>
          <p className="mt-3 leading-6 text-slate-300">Build durable concept mastery instead of memorizing repeated question wording.</p>
          <div className="mt-4 flex gap-2">
            <StatusBadge tone="success">NO AI RUNTIME</StatusBadge>
            <StatusBadge>LOCAL FIRST</StatusBadge>
          </div>
        </RetroPanel>
      </div>

      <div className="mt-12 flex items-center justify-between gap-4">
        <div>
          <Eyebrow>CAMPAIGN SELECT</Eyebrow>
          <h2 className="mt-2 text-2xl font-black text-slate-100">Choose your certification</h2>
        </div>
        <Link href="/history" className="text-xs font-bold tracking-[0.14em] text-slate-500 hover:text-amber-300">VIEW HISTORY →</Link>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {progress.map((item) => item && (
          <RetroPanel key={item.certification.code} accent>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <StatusBadge tone="warning">{item.certification.code}</StatusBadge>
                <h3 className="mt-4 text-xl font-black text-slate-100">{item.certification.name}</h3>
              </div>
              {item.reviewDue > 0 ? <StatusBadge tone="danger">{item.reviewDue} REVIEW DUE</StatusBadge> : <StatusBadge tone="success">ON TRACK</StatusBadge>}
            </div>
            <div className="mt-6">
              <ProgressBar value={item.masteryPercent} label="Concept mastery" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="border border-slate-700 bg-[#080d15] p-3"><strong className="block text-lg text-slate-100">{item.introduced}</strong><span className="text-[10px] uppercase text-slate-500">Introduced</span></div>
              <div className="border border-slate-700 bg-[#080d15] p-3"><strong className="block text-lg text-emerald-300">{item.mastered}</strong><span className="text-[10px] uppercase text-slate-500">Cleared</span></div>
              <div className="border border-slate-700 bg-[#080d15] p-3"><strong className="block text-lg text-amber-300">{item.reviewDue}</strong><span className="text-[10px] uppercase text-slate-500">Rematch</span></div>
            </div>
            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <Link href={`/learn/${item.certification.code}`} className="border border-amber-400 bg-amber-400 px-3 py-3 text-center text-xs font-black tracking-[0.12em] text-slate-950">CONTINUE</Link>
              <Link href={`/practice/${item.certification.code}`} className="border border-slate-600 px-3 py-3 text-center text-xs font-bold tracking-[0.12em] text-slate-200 hover:border-amber-400">PRACTICE</Link>
              <Link href={`/mock/${item.certification.code}`} className="border border-slate-600 px-3 py-3 text-center text-xs font-bold tracking-[0.12em] text-slate-200 hover:border-amber-400">BOSS EXAM</Link>
            </div>
          </RetroPanel>
        ))}
      </div>
    </main>
  );
}
