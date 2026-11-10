import { ArcadeArt } from "@/components/arcade-art";
import { ArcadeIcon } from "@/components/arcade-icon";
import { buttonClassName } from "@/components/arcade-button";
import { HudStats } from "@/components/hud-stats";
import { domainTone } from "@/components/retro-panel";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { certificationProgress } from "@/lib/learning/progress";
import { recommendNext } from "@/lib/learning/recommendation";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { CampaignMeters } from "@/components/progress-bar";

export default async function HomePage() {
  const certifications = await prisma.certification.findMany({ where: { active: true }, orderBy: { code: "asc" } });
  const [progress, openSessions, lastLesson, activeExams] = await Promise.all([
    Promise.all(certifications.map((certification) => certificationProgress(certification.code))),
    prisma.practiceSession.findMany({
      where: { endedAt: null, certification: { active: true } },
      include: { certification: { select: { code: true } } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.attempt.findFirst({
      where: { mode: "LEARN", question: { concept: { active: true, topic: { certification: { active: true } } } } },
      orderBy: { answeredAt: "desc" },
      select: { question: { select: { concept: { select: { slug: true, name: true, topic: { select: { certification: { select: { code: true } } } } } } } } },
    }),
    prisma.mockExam.findMany({
      where: { status: "IN_PROGRESS", certification: { active: true } },
      include: { certification: { select: { code: true } } },
      orderBy: { startedAt: "desc" },
    }),
  ]);
  const openSessionFor = (code: string) => openSessions.find((session) => session.certification.code === code) ?? null;
  const resumable = [
    ...activeExams.map((exam) => ({
      key: `exam-${exam.id}`,
      href: `/mock/${exam.certification.code}/${exam.id}`,
      title: `Resume ${exam.assessmentMode === "FRESH" ? "fresh exam" : "mock exam"} #${exam.id}`,
      detail: `${exam.certification.code} \u00b7 the timer keeps running while you are away`,
    })),
    ...openSessions.filter((session) => session.questionCount > 0).map((session) => ({
      key: `session-${session.id}`,
      href: `/practice/${session.certification.code}?session=${session.id}`,
      title: `Resume practice #${session.id}`,
      detail: `${session.certification.code} \u00b7 ${session.correctCount}/${session.questionCount} correct so far`,
    })),
    ...(lastLesson ? [{
      key: "lesson",
      href: `/learn/${lastLesson.question.concept.topic.certification.code}/${lastLesson.question.concept.slug}`,
      title: "Return to your last lesson",
      detail: `${lastLesson.question.concept.topic.certification.code} \u00b7 ${lastLesson.question.concept.name}`,
    }] : []),
  ];

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

      {resumable.length > 0 ? (
        <section className="continue-strip" aria-labelledby="continue-title">
          <div className="section-heading"><div><Eyebrow>CONTINUE</Eyebrow><h2 id="continue-title">Pick up where you left off</h2></div></div>
          <div className="continue-grid">
            {resumable.map((item) => (
              <Link key={item.key} href={item.href} className="run-link">
                <span><span className="activity-row__title block">{item.title}</span><span className="activity-meta block !mt-1">{item.detail}</span></span>
                <ArcadeIcon name="arrow" width={17} height={17} />
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="section-heading">
        <div><Eyebrow>CAMPAIGN SELECT</Eyebrow><h2>Choose your certification</h2></div>
        <Link href="/history" className="text-link">View history <ArcadeIcon name="arrow" width={17} height={17} /></Link>
      </div>
      <div className="certification-grid">
        {progress.map((item, index) => {
          if (!item) return null;
          const code = item.certification.code;
          const next = recommendNext({ code, reviewDue: item.reviewDue, started: item.introduced, nextConcept: item.nextConcept, openSessionId: openSessionFor(code)?.id ?? null });
          return (
            <RetroPanel key={code} accent tone={domainTone(index)} className="certification-card">
              <div className="certification-card__top">
                <span className="code-chip">{code}</span>
                {item.reviewDue > 0 ? <StatusBadge tone="danger">{item.reviewDue} REVIEW DUE</StatusBadge> : item.introduced === 0 ? <StatusBadge>NOT STARTED</StatusBadge> : <StatusBadge tone="success">NOTHING DUE</StatusBadge>}
              </div>
              <h3 className="certification-card__title">{item.certification.name}</h3>
              <CampaignMeters introduced={item.introduced} mastered={item.mastered} total={item.concepts.length} />
              <HudStats items={[
                { label: "Introduced", value: item.introduced },
                { label: "Cleared", value: item.mastered, tone: "success" },
                { label: "Rematch", value: item.reviewDue, tone: "accent" },
              ]} />
              <p className="certification-card__next"><strong>Recommended</strong> {next.reason}</p>
              <div className="certification-card__actions">
                <Link href={next.href} className={buttonClassName()}>{next.label} <ArcadeIcon name="arrow" width={16} height={16} /></Link>
                {next.kind === "LEARN" ? <Link href={`/practice/${code}`} className={buttonClassName("secondary")}>Practice</Link> : <Link href={`/learn/${code}`} className={buttonClassName("secondary")}>Stage map</Link>}
                <Link href={`/mock/${code}`} className={buttonClassName("secondary")}>Boss exam</Link>
              </div>
            </RetroPanel>
          );
        })}
      </div>
    </main>
  );
}
