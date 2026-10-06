import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";

export const metadata = { title: "Learn" };

export default async function LearnPage() {
  const certifications = await prisma.certification.findMany({
    where: { active: true },
    include: { _count: { select: { topics: true } } },
    orderBy: { code: "asc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Eyebrow>LEARN MODE</Eyebrow>
      <h1 className="mt-3 text-3xl font-black text-slate-100">Choose a campaign</h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-400">Short concept lessons followed immediately by a retrieval challenge.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {certifications.map((certification) => (
          <Link key={certification.id} href={`/learn/${certification.code}`}>
            <RetroPanel className="h-full transition hover:-translate-y-1 hover:border-amber-400/70">
              <div className="flex items-center justify-between gap-4">
                <StatusBadge tone="warning">{certification.code}</StatusBadge>
                <span className="text-xs text-slate-500">{certification._count.topics} areas</span>
              </div>
              <h2 className="mt-4 text-xl font-black text-slate-100">{certification.name}</h2>
              <p className="mt-3 text-sm text-slate-400">Open stage map →</p>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
