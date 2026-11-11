"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveMockDraft, submitMockExam } from "@/app/_actions/mock";
import { optionLetter } from "@/lib/learning/answers";
import { ArcadeButton } from "./arcade-button";
import { ArcadeIcon } from "./arcade-icon";
import { ExamTimer } from "./exam-timer";
import { RetroPanel, StatusBadge } from "./retro-panel";

export type RunnerQuestion = {
  questionId: number;
  position: number;
  type: string;
  prompt: string;
  difficulty: string;
  /** Already in the order fixed for this exam. Never includes correctness. */
  options: { key: string; text: string }[];
  selected: string[];
  flagged: boolean;
};

type Answer = { selected: string[]; flagged: boolean };

const saveMessages = {
  idle: "Answers save automatically",
  saving: "Saving\u2026",
  saved: "All answers saved",
  closed: "This exam is already submitted",
  expired: "Time is up; submitting your answers",
  failed: "Save failed. Your answers stay on this page and are sent when you submit.",
} as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return <ArcadeButton disabled={pending} className="w-full">{pending ? "Submitting\u2026" : "Submit exam"} <ArcadeIcon name="arrow" width={17} height={17} /></ArcadeButton>;
}

function jumpTo(position: number) {
  const target = document.getElementById(`exam-q-${position}`);
  target?.scrollIntoView({ block: "start" });
  target?.querySelector<HTMLElement>("input")?.focus({ preventScroll: true });
}

export function MockRunner({ examId, certification, mode, startedAt, durationMinutes, questions }: {
  examId: number;
  certification: string;
  mode: string;
  startedAt: string;
  durationMinutes: number;
  questions: RunnerQuestion[];
}) {
  const formId = `mock-exam-${examId}`;
  const dialog = useRef<HTMLDialogElement>(null);
  const queue = useRef<Promise<void>>(Promise.resolve());
  const [answers, setAnswers] = useState<Record<number, Answer>>(() => Object.fromEntries(questions.map((q) => [q.questionId, { selected: q.selected, flagged: q.flagged }])));
  const [saveState, setSaveState] = useState<keyof typeof saveMessages>("idle");

  const answerFor = (questionId: number) => answers[questionId] ?? { selected: [], flagged: false };
  const unanswered = questions.filter((q) => answerFor(q.questionId).selected.length === 0).map((q) => q.position);
  const flagged = questions.filter((q) => answerFor(q.questionId).flagged).map((q) => q.position);

  const update = (questionId: number, next: Answer) => {
    setAnswers((previous) => ({ ...previous, [questionId]: next }));
    setSaveState("saving");
    // Saves run one at a time, so an older save can never overwrite a newer choice.
    queue.current = queue.current
      .then(async () => {
        const result = await saveMockDraft(examId, questionId, next.selected, next.flagged);
        setSaveState(result.saved ? "saved" : result.reason ?? "failed");
      })
      .catch(() => setSaveState("failed"));
  };

  const jumpFromDialog = (position: number) => {
    dialog.current?.close();
    jumpTo(position);
  };

  return (
    <>
      <header className="exam-hud">
        <div>
          <h1 className="eyebrow">{mode === "FRESH" ? "SEALED FRESH EXAM" : "BOSS EXAM"}{" // "}{certification}</h1>
          <p className="exam-hud__description">{questions.length - unanswered.length} of {questions.length} answered &middot; {flagged.length} flagged &middot; no feedback until submit</p>
          <p className="exam-hud__save" role="status">{saveMessages[saveState]}</p>
        </div>
        <div className="exam-hud__timer"><p>Time left</p><ExamTimer startedAt={startedAt} durationMinutes={durationMinutes} formId={formId} /></div>
      </header>

      <details className="exam-map" open>
        <summary>Question map</summary>
        <p className="exam-map__legend"><span><i className="exam-map__swatch" data-answered="true" /> Answered</span><span><i className="exam-map__swatch" data-flagged="true" /> Flagged</span><span><i className="exam-map__swatch" /> Not answered</span></p>
        <div className="exam-nav">
          {questions.map((q) => {
            const answer = answerFor(q.questionId);
            const isAnswered = answer.selected.length > 0;
            return (
              <button key={q.questionId} type="button" className="exam-nav__item" data-answered={isAnswered} data-flagged={answer.flagged} onClick={() => jumpTo(q.position)} aria-label={`Question ${q.position}${isAnswered ? ", answered" : ", not answered"}${answer.flagged ? ", flagged" : ""}`}>
                {q.position}
              </button>
            );
          })}
        </div>
      </details>

      <form id={formId} action={submitMockExam} className="space-y-6">
        <input type="hidden" name="certification" value={certification} />
        <input type="hidden" name="examId" value={examId} />
        <input type="hidden" name="runner" value="1" />
        {questions.map((q) => {
          const multiple = q.type === "MULTIPLE_CHOICE";
          const answer = answerFor(q.questionId);
          return (
            <RetroPanel key={q.questionId} className="exam-question">
              <div id={`exam-q-${q.position}`} className="exam-question__header">
                <p className="exam-question__number">QUESTION {q.position}</p>
                <div className="exam-question__tools">
                  {multiple ? <StatusBadge tone="warning">Select all that apply</StatusBadge> : null}
                  <StatusBadge>{q.difficulty}</StatusBadge>
                  <label className="flag-toggle"><input type="checkbox" checked={answer.flagged} onChange={(event) => update(q.questionId, { ...answer, flagged: event.target.checked })} />Flag for review</label>
                </div>
              </div>
              <fieldset className="question-options">
                <legend className="question-prompt">{q.prompt}</legend>
                {q.options.map((option, index) => (
                  <label key={option.key} className="answer-option">
                    <input
                      type={multiple ? "checkbox" : "radio"}
                      name={`question_${q.questionId}`}
                      value={option.key}
                      checked={answer.selected.includes(option.key)}
                      onChange={(event) => {
                        const selected = multiple
                          ? event.target.checked ? [...answer.selected, option.key] : answer.selected.filter((key) => key !== option.key)
                          : [option.key];
                        update(q.questionId, { ...answer, selected });
                      }}
                    />
                    <span className="answer-option__key">{optionLetter(index)}</span><span className="answer-option__text">{option.text}</span>
                  </label>
                ))}
              </fieldset>
              {answer.selected.length > 0 ? <ArcadeButton type="button" variant="quiet" className="exam-question__clear" onClick={() => update(q.questionId, { ...answer, selected: [] })}>Clear answer</ArcadeButton> : null}
            </RetroPanel>
          );
        })}

        <RetroPanel accent className="exam-finish">
          <p className="panel-meta">{unanswered.length === 0 ? "Every question has an answer." : `${unanswered.length} unanswered.`} {flagged.length > 0 ? `${flagged.length} flagged for review.` : ""}</p>
          <ArcadeButton type="button" className="w-full" onClick={() => dialog.current?.showModal()}>Finish exam <ArcadeIcon name="arrow" width={17} height={17} /></ArcadeButton>
        </RetroPanel>

        <dialog ref={dialog} className="confirm-dialog" aria-labelledby={`${formId}-confirm`}>
          <div className="confirm-dialog__body">
            <h2 id={`${formId}-confirm`}>Submit this exam?</h2>
            <p className="panel-meta">After submitting you cannot change answers. Results and explanations appear straight away.</p>
            {unanswered.length > 0 ? (
              <div><p className="confirm-dialog__label">{unanswered.length} unanswered</p><div className="confirm-dialog__jump">{unanswered.map((position) => <button key={position} type="button" className="exam-nav__item" onClick={() => jumpFromDialog(position)}>{position}</button>)}</div></div>
            ) : null}
            {flagged.length > 0 ? (
              <div><p className="confirm-dialog__label">{flagged.length} flagged</p><div className="confirm-dialog__jump">{flagged.map((position) => <button key={position} type="button" className="exam-nav__item" data-flagged="true" onClick={() => jumpFromDialog(position)}>{position}</button>)}</div></div>
            ) : null}
            <div className="session-actions !mt-2">
              <ArcadeButton type="button" variant="secondary" onClick={() => dialog.current?.close()}>Keep working</ArcadeButton>
              <SubmitButton />
            </div>
          </div>
        </dialog>
      </form>
    </>
  );
}
