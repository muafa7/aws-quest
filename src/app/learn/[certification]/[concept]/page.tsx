import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSafeQuestionById } from "@/lib/learning/selector";
import { AttemptFeedback } from "@/components/feedback";
import { QuestionForm } from "@/components/question-form";
import { Eyebrow, RetroPanel } from "@/components/retro-panel";

export default async function LearnConceptPage({
  params,
  searchParams,
}: {
  params: Promise<{ certification: string; concept: string }>;
  searchParams: Promise<{ attempt?: string }>;
}) {
  const { certification, concept: conceptSlug } = await params;
  const { attempt: attemptParam } = await searchParams;

  const concept = await prisma.concept.findFirst({
    where: { slug: conceptSlug, topic: { certification: { code: certification } }, active: true },
    include: {
      lesson: true,
      questions: { where: { active: true }, select: { id: true }, orderBy: { code: "asc" } },
      topic: { select: { name: true } },
    },
  });
  if (!concept?.lesson) notFound();

  const previousAttempts = await prisma.attempt.findMany({
    where: { question: { conceptId: concept.id }, mode: "LEARN" },
    select: { questionId: true },
  });
  const seen = new Set(previousAttempts.map((attempt) => attempt.questionId));
  const questionId = concept.questions.find((question) => !seen.has(question.id))?.id ?? concept.questions[0]?.id;
  const question = questionId ? await getSafeQuestionById(questionId) : null;
  const attemptId = Number(attemptParam);
  const attempt = Number.isInteger(attemptId)
    ? await prisma.attempt.findFirst({ where: { id: attemptId, question: { conceptId: concept.id } } })
    : null;
  const keyPoints = JSON.parse(concept.lesson.keyPoints) as string[];

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Eyebrow>{certification} // {concept.topic.name}</Eyebrow>
          <h1 className="mt-2 text-2xl font-black text-slate-100">{concept.lesson.title}</h1>
        </div>
        <Link href={`/learn/${certification}`} className="text-xs font-bold tracking-[0.13em] text-slate-500 hover:text-amber-300">← STAGE MAP</Link>
      </div>

      <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
        <RetroPanel>
          <Eyebrow>LESSON</Eyebrow>
          <p className="mt-4 text-lg leading-8 text-slate-200">{concept.lesson.summary}</p>
          <div className="mt-6 space-y-3">
            {keyPoints.map((point, index) => (
              <div key={point} className="flex gap-3 border-l-2 border-slate-700 pl-4 text-sm leading-6 text-slate-400">
                <span className="text-amber-300">0{index + 1}</span><span>{point}</span>
              </div>
            ))}
          </div>
          {concept.keyNote ? (
            <div className="mt-6 border border-amber-800/70 bg-amber-950/20 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-400">Key Note</p>
              <p className="mt-2 text-sm leading-6 text-amber-100">{concept.keyNote}</p>
            </div>
          ) : null}
          {concept.referenceUrl ? <a href={concept.referenceUrl} target="_blank" rel="noreferrer" className="mt-5 inline-block text-xs text-slate-500 underline underline-offset-4 hover:text-amber-300">AWS reference ↗</a> : null}
        </RetroPanel>

        <div>
          {attempt ? (
            <div className="space-y-4">
              <AttemptFeedback attempt={attempt} explanation={concept.generalExplanation} keyNote={concept.keyNote} />
              <Link href={`/learn/${certification}`} className="block border border-amber-400 bg-amber-400 px-4 py-3 text-center text-sm font-black tracking-[0.14em] text-slate-950">CONTINUE TO MAP</Link>
            </div>
          ) : question ? (
            <RetroPanel accent>
              <Eyebrow>CHALLENGE</Eyebrow>
              <div className="mt-4"><QuestionForm question={question} certification={certification} conceptSlug={conceptSlug} mode="LEARN" /></div>
            </RetroPanel>
          ) : (
            <RetroPanel><p className="text-slate-400">No challenge has been seeded for this concept yet.</p></RetroPanel>
          )}
        </div>
      </div>
    </main>
  );
}
