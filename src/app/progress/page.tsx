import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { certificationProgress } from "@/lib/learning/progress";
import { RetroPanel, StatusBadge } from "@/components/retro-panel";
import { CampaignMeters } from "@/components/progress-bar";

export const metadata = { title: "Progress" };

export default async function ProgressPage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  const data = await Promise.all(certifications.map((item) => certificationProgress(item.code)));

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <PageHeader eyebrow="PROGRESS" title="Campaign status" icon="progress" tone="violet" />
      <div className="certification-grid">
        {data.map((item, index) => item && (
          <Link key={item.certification.id} href={`/progress/${item.certification.code}`} className="panel-link">
            <RetroPanel accent interactive tone={domainTone(index)} className="picker-card">
              <div className="certification-card__top"><span className="code-chip">{item.certification.code}</span>{item.reviewDue ? <StatusBadge tone="danger">{item.reviewDue} DUE</StatusBadge> : <StatusBadge tone="success">NO REVIEW DUE</StatusBadge>}</div>
              <h2>{item.certification.name}</h2>
              <div className="mb-6"><CampaignMeters introduced={item.introduced} mastered={item.mastered} total={item.concepts.length} masteryLabel="Mastery" /></div>
              <div className="picker-card__footer"><span>{item.mastered} of {item.concepts.length} concepts cleared</span><ArcadeIcon name="arrow" /></div>
            </RetroPanel>
          </Link>
        ))}
      </div>
    </main>
  );
}
