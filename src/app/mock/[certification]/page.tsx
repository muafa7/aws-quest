import { ArcadeButton, buttonClassName } from "@/components/arcade-button";
import { ArcadeIcon } from "@/components/arcade-icon";
import { HudStats } from "@/components/hud-stats";
import Link from "next/link";
import { notFound } from "next/navigation";
import { startMockExam } from "@/app/_actions/mock";
import { Eyebrow, RetroPanel, StatusBadge } from "@/components/retro-panel";
import { prisma } from "@/lib/prisma";
import { examDeadline, packStatus, type PackStatus } from "@/lib/learning/mock-selection";
import { trainingQuestionWhere } from "@/lib/learning/question-pools";

function packLabel(status: PackStatus, examLength: number) {
  switch (status.state) {
    case "AVAILABLE": return "Sealed and available";
    case "USED": return "Already used";
    case "EXPOSED": return `${status.exposed} question${status.exposed === 1 ? " was" : "s were"} already shown, so it is no longer fresh`;
    case "INCOMPLETE": return `Incomplete: ${status.size} of ${examLength} questions`;
  }
}

export default async function MockCertificationPage({ params }: { params: Promise<{ certification: string }> }) {
  const { certification: code } = await params;
  const certification = await prisma.certification.findUnique({ where: { code, active: true } });
  if (!certification) notFound();

  const inCertification = { concept: { topic: { certificationId: certification.id } } };
  const [availableQuestions, recent, active, packQuestions, packExams] = await Promise.all([
    prisma.question.count({ where: { ...trainingQuestionWhere, concept: { active: true, topic: { certificationId: certification.id } } } }),
    prisma.mockExam.findMany({ where: { certificationId: certification.id }, orderBy: { startedAt: "desc" }, take: 6 }),
    prisma.mockExam.findFirst({ where: { certificationId: certification.id, status: "IN_PROGRESS" }, orderBy: { startedAt: "desc" }, include: { _count: { select: { questions: { where: { selectedDraftSnapshot: { notIn: ["[]"] } } } } } } }),
    prisma.question.findMany({
      where: { active: true, assessmentPackId: { not: null }, ...inCertification },
      select: { assessmentPackId: true, _count: { select: { attempts: true, mockItems: true } } },
    }),
    prisma.mockExam.findMany({ where: { certificationId: certification.id, assessmentPackId: { not: null } }, select: { id: true, assessmentPackId: true } }),
  ]);

  const packs = new Map<string, { size: number; exposed: number }>();
  for (const question of packQuestions) {
    if (!question.assessmentPackId) continue;
    const entry = packs.get(question.assessmentPackId) ?? { size: 0, exposed: 0 };
    entry.size += 1;
    if (question._count.attempts + question._count.mockItems > 0) entry.exposed += 1;
    packs.set(question.assessmentPackId, entry);
  }
  const expired = active ? examDeadline(active.startedAt, active.durationMinutes) <= new Date() : false;
  const questionsNow = Math.min(certification.examQuestionCount, availableQuestions);

  return (
    <main id="main-content" tabIndex={-1} className="page-wrap page-wrap--reading">
      <RetroPanel accent tone="coral" className="session-hero">
        <div className="session-hero__icon"><ArcadeIcon name="mock" width={28} height={28} /></div>
        <Eyebrow>BOSS EXAM // {code}</Eyebrow>
        <h1>{certification.name}</h1>
        <HudStats items={[
          { label: "Questions", value: questionsNow },
          { label: "Minutes", value: certification.durationMinutes, tone: "accent" },
          { label: "Practice bank", value: availableQuestions },
        ]} />
        {availableQuestions < certification.examQuestionCount ? <p className="key-note text-sm leading-7 text-amber-100">The training bank has {availableQuestions} question{availableQuestions === 1 ? "" : "s"}, fewer than a full {certification.examQuestionCount}-question exam, so this is a partial mock.</p> : null}
        <ul className="exam-rules">
          <li><ArcadeIcon name="check" width={17} height={17} />Questions follow the domain blueprint; order and answer positions are shuffled</li>
          <li><ArcadeIcon name="check" width={17} height={17} />Questions you have not seen are used first, so each run differs</li>
          <li><ArcadeIcon name="check" width={17} height={17} />Answers and flags save as you go; you can leave and resume</li>
          <li><ArcadeIcon name="clock" width={17} height={17} />No feedback until you submit or the timer ends</li>
        </ul>
        {active ? (
          <div className="mt-8">
            <p className="session-hero__description !mt-0 mb-4">{expired ? `Time ran out on exam #${active.id}. Open it to submit the ${active._count.questions} answer${active._count.questions === 1 ? "" : "s"} you saved; it will count as submitted late.` : `Exam #${active.id} is in progress with ${active._count.questions} of ${active.questionCount} answered. Finish it before starting another.`}</p>
            <Link href={`/mock/${code}/${active.id}`} className={buttonClassName("primary", "w-full")}>{expired ? "Open and submit" : "Resume exam"} <ArcadeIcon name="arrow" width={18} height={18} /></Link>
          </div>
        ) : (
          <form action={startMockExam} className="mt-8">
            <input type="hidden" name="certification" value={code} />
            <input type="hidden" name="assessmentMode" value="STANDARD" />
            <ArcadeButton disabled={availableQuestions === 0} className="w-full">Start mock exam <ArcadeIcon name="arrow" width={18} height={18} /></ArcadeButton>
          </form>
        )}
      </RetroPanel>

      {packs.size > 0 ? (
        <RetroPanel tone="violet" className="mt-7">
          <div className="panel-heading"><ArcadeIcon name="layers" /><h2>Sealed fresh assessments</h2></div>
          <p className="panel-meta">These questions never appear in Learn, Practice, or standard mocks. Each pack can be taken once and measures how you do on questions you have never seen. Starting a pack uses it up, even if you leave without submitting.</p>
          <div className="mt-5 space-y-3">
            {[...packs.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([pack, info]) => {
              const usedBy = packExams.find((exam) => exam.assessmentPackId === pack)?.id ?? null;
              const status = packStatus({ size: info.size, examLength: certification.examQuestionCount, exposed: info.exposed, usedByExamId: usedBy });
              return (
                <div key={pack} className="pack-row">
                  <div><p className="activity-row__title">{pack}</p><p className="activity-meta !mt-1">{packLabel(status, certification.examQuestionCount)}</p></div>
                  {status.state === "USED" ? (
                    <Link href={`/mock/${code}/${status.examId}`} className={buttonClassName("secondary")}>View result</Link>
                  ) : status.state === "AVAILABLE" && !active ? (
                    <form action={startMockExam} className="pack-row__start">
                      <input type="hidden" name="certification" value={code} />
                      <input type="hidden" name="assessmentMode" value="FRESH" />
                      <input type="hidden" name="assessmentPackId" value={pack} />
                      <label className="pack-row__confirm"><input type="checkbox" required /> I understand this pack can only be taken once</label>
                      <ArcadeButton variant="secondary">Start fresh exam</ArcadeButton>
                    </form>
                  ) : <StatusBadge tone={status.state === "AVAILABLE" ? "neutral" : "warning"}>{status.state === "AVAILABLE" ? "Finish the active exam first" : "Unavailable"}</StatusBadge>}
                </div>
              );
            })}
          </div>
        </RetroPanel>
      ) : null}

      {recent.length > 0 ? (
        <section className="mt-10">
          <div className="section-heading"><div><Eyebrow>RECENT RUNS</Eyebrow></div></div>
          <div className="space-y-3">{recent.map((exam) => (
            <Link key={exam.id} href={`/mock/${code}/${exam.id}`} className="run-link">
              <span>{exam.assessmentMode === "FRESH" ? "Fresh" : "Standard"} #{exam.id} &middot; {exam.startedAt.toLocaleDateString("en-GB")}{exam.timeValidity === "EXPIRED" ? " \u00b7 submitted late" : ""}</span>
              <StatusBadge tone={exam.status === "COMPLETED" ? "success" : "warning"}>{exam.status === "COMPLETED" ? `${exam.correctCount}/${exam.questionCount}` : "IN PROGRESS"}</StatusBadge>
            </Link>
          ))}</div>
        </section>
      ) : null}
    </main>
  );
}
