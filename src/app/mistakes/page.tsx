import Link from "next/link";
import type { Prisma } from "../../../generated/prisma/client";
import { PageHeader } from "@/components/page-header";
import { ArcadeIcon } from "@/components/arcade-icon";
import { AnswerList, OptionBreakdown } from "@/components/feedback";
import { RetroPanel, StatusBadge } from "@/components/retro-panel";
import { prisma } from "@/lib/prisma";
import { reviewOptions, type AnswerRecord } from "@/lib/learning/feedback";
import { MISTAKES_PER_PAGE, mistakesHref, newestFirstPage, parseMistakeFilters, type MistakeFilters, type MistakeSource } from "@/lib/learning/mistakes";

export const metadata = { title: "Mistakes" };

type OptionRow = { key: string; text: string; explanation: string | null };
type ConceptRow = { name: string; slug: string; generalExplanation: string; keyNote: string | null; referenceUrl: string | null; topic: { name: string } };

type Mistake = {
  id: string;
  at: Date;
  source: Exclude<MistakeSource, "ALL">;
  context: string;
  prompt: string;
  record: AnswerRecord;
  options: OptionRow[];
  concept: ConceptRow;
  sourceUrl: string | null;
};

const conceptSelect = { select: { name: true, slug: true, generalExplanation: true, keyNote: true, referenceUrl: true, topic: { select: { name: true } } } } as const;
const optionSelect = { select: { key: true, text: true, explanation: true }, orderBy: { key: "asc" } } as const;

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="filter-group"><span className="filter-group__label">{label}</span><div className="filter-group__chips">{children}</div></div>;
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} className="filter-chip" aria-current={active ? "true" : undefined}>{children}</Link>;
}

function MistakeCard({ item, code }: { item: Mistake; code: string }) {
  const rows = reviewOptions(item.record, item.options);
  const confident = item.record.confidence === "HIGH";
  return (
    <RetroPanel accent={confident} tone={confident ? "danger" : "neutral"} className="mistake-card">
      <div className="mistake-card__top">
        <div><p className="activity-row__title">{item.concept.name}</p><p className="activity-meta !mt-1">{item.concept.topic.name} &middot; {item.context} &middot; {item.at.toLocaleString("en-GB")}</p></div>
        <span className="status-badges">
          <StatusBadge>{item.source}</StatusBadge>
          {confident ? <StatusBadge tone="danger">Confident miss</StatusBadge> : item.record.confidence ? <StatusBadge>{item.record.confidence}</StatusBadge> : null}
        </span>
      </div>
      <p className="mistake-card__prompt">{item.prompt}</p>
      <div className="feedback-answer-grid">
        <dl className="feedback-answer" data-tone="danger"><dt>Your answer</dt><dd><AnswerList rows={rows.filter((row) => row.selected)} /></dd></dl>
        <dl className="feedback-answer" data-tone="success"><dt>Correct answer</dt><dd><AnswerList rows={rows.filter((row) => row.correct)} /></dd></dl>
      </div>
      <details className="feedback-details" open={confident}>
        <summary>Why the correct answer wins</summary>
        <div className="feedback-review"><h3>Concept Review</h3><p lang="id">{item.concept.generalExplanation}</p></div>
        {item.concept.keyNote ? <div className="key-note mt-5"><p className="key-note__label">Key Note</p><p className="key-note__text" lang="id">{item.concept.keyNote}</p></div> : null}
        <OptionBreakdown rows={rows} sourceUrl={item.sourceUrl} />
      </details>
      <Link href={`/learn/${code}/${item.concept.slug}?recall=1`} className="text-link mt-2">Retry this concept from memory <ArcadeIcon name="arrow" width={15} height={15} /></Link>
    </RetroPanel>
  );
}

export default async function MistakesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = parseMistakeFilters(await searchParams);
  const certifications = await prisma.certification.findMany({
    where: { active: true },
    orderBy: { code: "asc" },
    select: { code: true, topics: { orderBy: { order: "asc" }, select: { slug: true, name: true } } },
  });

  const certification = certifications.find((item) => item.code === filters.certification) ?? certifications[0];
  if (!certification) {
    return (
      <main id="main-content" tabIndex={-1} className="page-wrap">
        <PageHeader eyebrow="MISTAKE REVIEW" title="Wrong answers" icon="review" tone="coral" />
        <p className="empty-plate">No certifications are available yet.</p>
      </main>
    );
  }
  const domain = certification.topics.find((topic) => topic.slug === filters.domain) ?? null;
  const active: MistakeFilters = { ...filters, certification: certification.code, domain: domain?.slug ?? null };

  const questionScope: Prisma.QuestionWhereInput = { concept: { topic: { certification: { code: certification.code }, ...(domain ? { slug: domain.slug } : {}) } } };
  const attemptWhere: Prisma.AttemptWhereInput = {
    isCorrect: false,
    mode: active.source === "LEARN" || active.source === "PRACTICE" ? active.source : { in: ["LEARN", "PRACTICE"] },
    ...(active.sessionId ? { practiceSessionId: active.sessionId } : {}),
    ...(active.confidentOnly ? { confidence: "HIGH" } : {}),
    question: questionScope,
  };
  const includeAttempts = active.source !== "MOCK";
  // Mock answers carry no confidence rating, and only finished exams have been graded.
  const includeMock = (active.source === "ALL" || active.source === "MOCK") && !active.confidentOnly;
  const mockWhere: Prisma.MockExamQuestionWhereInput = { isCorrect: false, mockExam: { status: "COMPLETED", certification: { code: certification.code } }, question: questionScope };

  const [attemptCount, mockCount] = await Promise.all([
    includeAttempts ? prisma.attempt.count({ where: attemptWhere }) : 0,
    includeMock ? prisma.mockExamQuestion.count({ where: mockWhere }) : 0,
  ]);
  const total = attemptCount + mockCount;
  const pages = Math.max(1, Math.ceil(total / MISTAKES_PER_PAGE));
  const page = Math.min(active.page, pages);
  const take = page * MISTAKES_PER_PAGE;

  const [attempts, mockItems] = await Promise.all([
    includeAttempts
      ? prisma.attempt.findMany({
          where: attemptWhere,
          orderBy: [{ answeredAt: "desc" }, { id: "desc" }],
          take,
          include: { question: { select: { sourceUrl: true, options: optionSelect, concept: conceptSelect } } },
        })
      : [],
    includeMock
      ? prisma.mockExamQuestion.findMany({
          where: mockWhere,
          orderBy: [{ mockExam: { endedAt: "desc" } }, { position: "asc" }],
          take,
          include: { mockExam: { select: { id: true, startedAt: true, endedAt: true, assessmentMode: true } }, question: { select: { prompt: true, sourceUrl: true, options: optionSelect, concept: conceptSelect } } },
        })
      : [],
  ]);

  const items = newestFirstPage<Mistake>([
    attempts.map((attempt) => ({
      id: `attempt-${attempt.id}`,
      at: attempt.answeredAt,
      source: attempt.mode === "LEARN" ? "LEARN" : "PRACTICE",
      context: attempt.practiceSessionId ? `Session #${attempt.practiceSessionId}` : attempt.mode === "LEARN" ? "Lesson" : "Practice",
      prompt: attempt.questionTextSnapshot,
      record: attempt,
      options: attempt.question.options,
      concept: attempt.question.concept,
      sourceUrl: attempt.question.sourceUrl ?? attempt.question.concept.referenceUrl,
    })),
    mockItems.map((item) => ({
      id: `mock-${item.id}`,
      at: item.mockExam.endedAt ?? item.mockExam.startedAt,
      source: "MOCK",
      context: `${item.mockExam.assessmentMode === "FRESH" ? "Fresh mock" : "Mock"} #${item.mockExam.id}, Q${item.position}`,
      prompt: item.questionTextSnapshot ?? item.question.prompt,
      record: {
        isCorrect: false,
        confidence: null,
        selectedOptionsSnapshot: item.selectedOptionsSnapshot,
        correctOptionsSnapshot: item.correctOptionsSnapshot,
        optionOrderSnapshot: item.optionOrderSnapshot,
        optionsSnapshot: item.optionsSnapshot,
      },
      options: item.question.options,
      concept: item.question.concept,
      sourceUrl: item.question.sourceUrl ?? item.question.concept.referenceUrl,
    })),
  ], page);

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
      <PageHeader eyebrow="MISTAKE REVIEW" title="Wrong answers" description="Every miss from Learn, Practice, and finished mock exams, newest first. Confident misses are flagged: they usually point to a misconception rather than a gap." icon="review" tone="coral" />
      <nav className="filter-bar" aria-label="Filter mistakes">
        <FilterGroup label="Certification">
          {certifications.map((item) => <Chip key={item.code} href={mistakesHref(active, { certification: item.code })} active={item.code === certification.code}>{item.code}</Chip>)}
        </FilterGroup>
        <FilterGroup label="Domain">
          <Chip href={mistakesHref(active, { domain: null })} active={!domain}>All</Chip>
          {certification.topics.map((topic) => <Chip key={topic.slug} href={mistakesHref(active, { domain: topic.slug })} active={topic.slug === domain?.slug}>{topic.name}</Chip>)}
        </FilterGroup>
        <FilterGroup label="Source">
          {(["ALL", "LEARN", "PRACTICE", "MOCK"] as const).map((source) => <Chip key={source} href={mistakesHref(active, { source, sessionId: source === "PRACTICE" ? active.sessionId : null })} active={active.source === source && !(source === "PRACTICE" && active.sessionId)}>{source === "ALL" ? "All" : source[0] + source.slice(1).toLowerCase()}</Chip>)}
          {active.sessionId ? <Chip href={mistakesHref(active, { sessionId: null, source: "ALL" })} active>Session #{active.sessionId} <ArcadeIcon name="close" width={13} height={13} /></Chip> : null}
        </FilterGroup>
        <FilterGroup label="Confidence">
          <Chip href={mistakesHref(active, { confidentOnly: false })} active={!active.confidentOnly}>Any</Chip>
          <Chip href={mistakesHref(active, { confidentOnly: true })} active={active.confidentOnly}>Confident misses</Chip>
        </FilterGroup>
      </nav>
      <p className="panel-meta mb-5">{total === 0 ? "No mistakes" : `${total} mistake${total === 1 ? "" : "s"}`}{pages > 1 ? ` \u00b7 page ${page} of ${pages}` : ""}</p>
      {items.length > 0 ? (
        <div className="space-y-5">{items.map((item) => <MistakeCard key={item.id} item={item} code={certification.code} />)}</div>
      ) : (
        <div className="empty-plate"><ArcadeIcon name="review" width={28} height={28} /><p>{active.domain || active.source !== "ALL" || active.confidentOnly ? "No mistakes match these filters." : `No mistakes recorded for ${certification.code} yet. Wrong answers from Learn, Practice, and finished mock exams appear here.`}</p></div>
      )}
      {pages > 1 ? (
        <nav className="pager" aria-label="Mistake pages">
          {page > 1 ? <Link href={mistakesHref(active, { page: page - 1 })} className="text-link"><ArcadeIcon name="back" width={15} height={15} /> Newer</Link> : <span />}
          <span className="panel-meta">Page {page} of {pages}</span>
          {page < pages ? <Link href={mistakesHref(active, { page: page + 1 })} className="text-link">Older <ArcadeIcon name="arrow" width={15} height={15} /></Link> : <span />}
        </nav>
      ) : null}
    </main>
  );
}
