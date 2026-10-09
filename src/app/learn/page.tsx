import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { RetroPanel } from "@/components/retro-panel";

export const metadata = { title: "Learn" };

export default async function LearnPage() {
  const certifications = await prisma.certification.findMany({
    where: { active: true },
    include: { _count: { select: { topics: true } } },
    orderBy: { code: "asc" },
  });

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <PageHeader eyebrow="LEARN MODE" title="Choose a campaign" description="Short concept lessons followed immediately by a retrieval challenge." icon="learn" />
      <div className="certification-grid">
        {certifications.map((certification, index) => (
          <Link key={certification.id} href={`/learn/${certification.code}`} className="panel-link">
            <RetroPanel accent interactive tone={domainTone(index)} className="picker-card">
              <div className="certification-card__top"><span className="code-chip">{certification.code}</span><span className="picker-card__icon"><ArcadeIcon name="learn" width={24} height={24} /></span></div>
              <h2>{certification.name}</h2>
              <div className="picker-card__footer"><span>{certification._count.topics} areas &middot; Open stage map</span><ArcadeIcon name="arrow" /></div>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
