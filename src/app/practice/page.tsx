import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RetroPanel } from "@/components/retro-panel";

export const metadata = { title: "Practice" };

export default async function PracticePage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <PageHeader eyebrow="PRACTICE MODE" title="Adaptive training" description="The engine prioritizes misconceptions, due reviews, weak concepts, and unseen material while avoiding immediate exact repeats." icon="practice" tone="teal" />
      <div className="certification-grid">
        {certifications.map((certification, index) => (
          <Link key={certification.id} href={`/practice/${certification.code}`} className="panel-link">
            <RetroPanel accent interactive tone={domainTone(index)} className="picker-card">
              <div className="certification-card__top"><span className="code-chip">{certification.code}</span><span className="picker-card__icon"><ArcadeIcon name="practice" width={24} height={24} /></span></div>
              <h2>{certification.name}</h2>
              <div className="picker-card__footer"><span>Start unlimited practice</span><ArcadeIcon name="arrow" /></div>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
