import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { certificationProgress } from "@/lib/learning/progress";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { ProgressBar } from "@/components/progress-bar";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  const data = await Promise.all(certifications.map((item) => certificationProgress(item.code)));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Eyebrow>PROGRESS</Eyebrow>
      <h1 className="mt-3 text-3xl font-black text-slate-100">Campaign status</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {data.map((item) => item && (
          <Link key={item.certification.id} href={`/progress/${item.certification.code}`}>
            <RetroPanel className="h-full transition hover:border-amber-400/70">
              <div className="flex items-center justify-between gap-3"><StatusBadge tone="warning">{item.certification.code}</StatusBadge>{item.reviewDue ? <StatusBadge tone="danger">{item.reviewDue} DUE</StatusBadge> : <StatusBadge tone="success">CLEAR</StatusBadge>}</div>
              <h2 className="mt-4 text-lg font-black text-slate-100">{item.certification.name}</h2>
              <div className="mt-5"><ProgressBar value={item.masteryPercent} label="Mastery" /></div>
              <p className="mt-4 text-xs text-slate-500">{item.mastered} of {item.concepts.length} concepts cleared</p>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
