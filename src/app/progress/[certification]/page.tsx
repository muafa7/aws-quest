import { PageHeader } from "@/components/page-header";
import { HudStats } from "@/components/hud-stats";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { notFound } from "next/navigation";
import { certificationProgress } from "@/lib/learning/progress";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { CampaignMeters } from "@/components/progress-bar";

function accuracy(correct: number, total: number) {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

export default async function CertificationProgressPage({ params }: { params: Promise<{ certification: string }> }) {
  const { certification: code } = await params;
  const data = await certificationProgress(code);
  if (!data) return notFound();
  const now = new Date();

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap">
      <PageHeader eyebrow={<>PROGRESS // {code}</>} title={data.certification.name} icon="progress" tone="violet" action={<CampaignMeters introduced={data.introduced} mastered={data.mastered} total={data.concepts.length} masteryLabel="Overall mastery" />} />
      <RetroPanel className="progress-summary" tone="violet">
        <HudStats items={[
          { label: "Concepts", value: data.concepts.length },
          { label: "Introduced", value: data.introduced },
          { label: "Cleared", value: data.mastered, tone: "success" },
          { label: "Review Due", value: data.reviewDue, tone: "accent" },
        ]} />
      </RetroPanel>
      <section>
        <Eyebrow>CONCEPT STATUS</Eyebrow>
        {data.certification.topics.map((topic, topicIndex) => (
          <section className="domain-band" data-tone={domainTone(topicIndex)} key={topic.id}>
            <div className="domain-band__heading"><span className="domain-band__index">{String(topicIndex + 1).padStart(2, "0")}</span><h2>{topic.name}</h2></div>
            <div className="progress-list">
              {topic.concepts.map((concept) => {
                const progress = concept.progress;
                const due = progress?.nextReviewAt && progress.nextReviewAt <= now;
                return (
                  <article key={concept.id} className="progress-row">
                    <div className="progress-row__heading">
                      <Link className="progress-row__title" href={`/learn/${code}/${concept.slug}`}>{concept.name}</Link>
                      <p className="progress-row__topic">{topic.name}</p>
                      {progress?.masteredAt ? <StatusBadge tone="success">CLEARED</StatusBadge> : due ? <StatusBadge tone="danger">DUE</StatusBadge> : (progress?.totalAttempts ?? 0) > 0 ? <StatusBadge>TRAINING</StatusBadge> : <StatusBadge>NEW</StatusBadge>}
                    </div>
                    <dl className="progress-row__meta">
                      <div><dt>Attempts</dt><dd>{progress?.totalAttempts ?? 0}</dd></div>
                      <div><dt>Accuracy</dt><dd>{accuracy(progress?.correctAttempts ?? 0, progress?.totalAttempts ?? 0)}%</dd></div>
                      <div><dt>Review Stage</dt><dd>{progress?.reviewStage ?? 0}</dd></div>
                      <div><dt>Next Review</dt><dd>{progress?.nextReviewAt ? progress.nextReviewAt.toLocaleDateString("en-GB") : "\u2014"}</dd></div>
                    </dl>
                  </article>
                );
              })}
              {topic.concepts.length === 0 ? <p className="empty-plate">Content not seeded for this area yet.</p> : null}
            </div>
          </section>
        ))}
      </section>
    </main>
  );
}
