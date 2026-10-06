import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";

export const metadata = { title: "Mock Exam" };

export default async function MockPage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Eyebrow>BOSS EXAM</Eyebrow>
      <h1 className="mt-3 text-3xl font-black text-slate-100">Mock certification exam</h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-400">Timed. No confidence input. No feedback until submission. Scores are internal practice scores, not official AWS scaled scores.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {certifications.map((certification) => (
          <Link key={certification.id} href={`/mock/${certification.code}`}>
            <RetroPanel className="h-full transition hover:border-amber-400/70">
              <div className="flex justify-between gap-3"><StatusBadge tone="warning">{certification.code}</StatusBadge><StatusBadge>{certification.durationMinutes} MIN</StatusBadge></div>
              <h2 className="mt-4 text-xl font-black text-slate-100">{certification.name}</h2>
              <p className="mt-3 text-sm text-slate-500">Target {certification.examQuestionCount} questions →</p>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
