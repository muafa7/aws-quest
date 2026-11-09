import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RetroPanel, StatusBadge } from "@/components/retro-panel";

export const metadata = { title: "Mock Exam" };

export default async function MockPage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <PageHeader eyebrow="BOSS EXAM" title="Mock certification exam" description="Timed. No confidence input. No feedback until submission. Scores are internal practice scores, not official AWS scaled scores." icon="mock" tone="coral" />
      <div className="certification-grid">
        {certifications.map((certification, index) => (
          <Link key={certification.id} href={`/mock/${certification.code}`} className="panel-link">
            <RetroPanel accent interactive tone={domainTone(index)} className="picker-card">
              <div className="certification-card__top"><span className="code-chip">{certification.code}</span><StatusBadge>{certification.durationMinutes} MIN</StatusBadge></div>
              <h2>{certification.name}</h2>
              <div className="picker-card__footer"><span>Target {certification.examQuestionCount} questions</span><ArcadeIcon name="arrow" /></div>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
