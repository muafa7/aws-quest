import { ArcadeArt } from "@/components/arcade-art";
import { ArcadeIcon } from "@/components/arcade-icon";
import { buttonClassName } from "@/components/arcade-button";
import { HudStats } from "@/components/hud-stats";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { certificationProgress } from "@/lib/learning/progress";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { CampaignMeters } from "@/components/progress-bar";

export default async function HomePage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  const progress = await Promise.all(certifications.map((certification) => certificationProgress(certification.code)));

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__copy">
          <span className="hero-label">PLAYER TERMINAL // READY</span>
          <h1 id="home-title" className="home-hero__title">Learn AWS.<br /><em>Make it stick.</em></h1>
          <p>Short lessons. Immediate retrieval. Adaptive rematches. Serious certification practice underneath a game-like shell.</p>
        </div>
        <div className="home-hero__visual"><ArcadeArt /></div>
        <div className="hero-objective">
          <div className="hero-objective__copy"><strong>System objective</strong><span>Build durable concept mastery, not memorized answers.</span></div>
          <div className="hero-objective__badges"><StatusBadge tone="success">NO AI RUNTIME</StatusBadge><StatusBadge>LOCAL FIRST</StatusBadge></div>
        </div>
      </section>

      <div className="section-heading">
        <div><Eyebrow>CAMPAIGN SELECT</Eyebrow><h2>Choose your certification</h2></div>
        <Link href="/history" className="text-link">View history <ArcadeIcon name="arrow" width={17} height={17} /></Link>
      </div>
      <div className="certification-grid">
        {progress.map((item, index) => item && (
          <RetroPanel key={item.certification.code} accent tone={domainTone(index)} className="certification-card">
            <div className="certification-card__top">
              <span className="code-chip">{item.certification.code}</span>
              {item.reviewDue > 0 ? <StatusBadge tone="danger">{item.reviewDue} REVIEW DUE</StatusBadge> : <StatusBadge tone="success">ON TRACK</StatusBadge>}
            </div>
            <h3 className="certification-card__title">{item.certification.name}</h3>
            <CampaignMeters introduced={item.introduced} mastered={item.mastered} total={item.concepts.length} />
            <HudStats items={[
              { label: "Introduced", value: item.introduced },
              { label: "Cleared", value: item.mastered, tone: "success" },
              { label: "Rematch", value: item.reviewDue, tone: "accent" },
            ]} />
            <div className="certification-card__actions">
              <Link href={`/learn/${item.certification.code}`} className={buttonClassName()}>Continue <ArcadeIcon name="arrow" width={16} height={16} /></Link>
              <Link href={`/practice/${item.certification.code}`} className={buttonClassName("secondary")}>Practice</Link>
              <Link href={`/mock/${item.certification.code}`} className={buttonClassName("secondary")}>Boss exam</Link>
            </div>
          </RetroPanel>
        ))}
      </div>
    </main>
  );
}
