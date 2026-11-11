import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { certificationProgress } from "@/lib/learning/progress";
import { RetroPanel } from "@/components/retro-panel";
import { CampaignMeters } from "@/components/progress-bar";
import { ClearMeter, ConceptStatusBadges } from "@/components/concept-status";

export default async function LearnCertificationPage({ params }: { params: Promise<{ certification: string }> }) {
  const { certification: code } = await params;
  const data = await certificationProgress(code);
  if (!data) return notFound();

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <PageHeader eyebrow={<>CAMPAIGN // {data.certification.code}</>} title={data.certification.name} description="Concept stages remain open. Learn in any order. A stage clears once every challenge has been answered." icon="learn" action={<CampaignMeters introduced={data.introduced} mastered={data.mastered} total={data.concepts.length} masteryLabel="Campaign mastery" />} />
      <div>
        {data.topics.map((topic, topicIndex) => (
          <section key={topic.id} className="domain-band" data-tone={domainTone(topicIndex)}>
            <div className="domain-band__heading"><span className="domain-band__index">{String(topicIndex + 1).padStart(2, "0")}</span><h2>{topic.name}</h2></div>
            <div className="concept-grid">
              {topic.concepts.map((concept) => {
                return (
                  <Link key={concept.id} href={`/learn/${data.certification.code}/${concept.slug}`} className="panel-link">
                    <RetroPanel interactive tone={domainTone(topicIndex)} className="concept-card">
                      <div className="concept-card__top">
                        <span className="concept-card__stage">Stage {String(concept.order).padStart(2, "0")}</span>
                        <ConceptStatusBadges state={concept.state} />
                      </div>
                      <h3>{concept.name}</h3>
                      <ClearMeter clear={concept.clear} />
                      <div className="concept-card__footer"><span /><ArcadeIcon name="arrow" width={17} height={17} /></div>
                    </RetroPanel>
                  </Link>
                );
              })}
              {topic.concepts.length === 0 ? <p className="empty-plate">Content not seeded for this area yet.</p> : null}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
