import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";

export const metadata = { title: "Practice" };

export default async function PracticePage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Eyebrow>PRACTICE MODE</Eyebrow>
      <h1 className="mt-3 text-3xl font-black text-slate-100">Adaptive training</h1>
      <p className="mt-3 max-w-2xl leading-7 text-slate-400">The engine prioritizes misconceptions, due reviews, weak concepts, and unseen material while avoiding immediate exact repeats.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {certifications.map((certification) => (
          <Link key={certification.id} href={`/practice/${certification.code}`}>
            <RetroPanel className="h-full transition hover:border-amber-400/70">
              <StatusBadge tone="warning">{certification.code}</StatusBadge>
              <h2 className="mt-4 text-xl font-black text-slate-100">{certification.name}</h2>
              <p className="mt-3 text-sm text-slate-500">Start unlimited practice →</p>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
