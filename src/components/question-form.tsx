import { submitLearningAnswer } from "@/app/_actions/learning";
import type { SafeQuestion } from "@/lib/learning/types";
import { StatusBadge } from "./retro-panel";
import { ArcadeButton } from "./arcade-button";
import { ArcadeIcon } from "./arcade-icon";

export function QuestionForm({ question, certification, mode, sessionId, conceptSlug, }: {
  question: SafeQuestion;
  certification: string;
  mode: "LEARN" | "PRACTICE";
  sessionId?: number;
  conceptSlug?: string;
}) {
  const multiple = question.type === "MULTIPLE_CHOICE";

  return (
    <form action={submitLearningAnswer} className="question-form">
      <input type="hidden" name="certification" value={certification} />
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="mode" value={mode} />
      {sessionId ? <input type="hidden" name="sessionId" value={sessionId} /> : null}
      {conceptSlug ? <input type="hidden" name="conceptSlug" value={conceptSlug} /> : null}
      <div className="question-tags">
        <StatusBadge>{question.difficulty}</StatusBadge>
        <StatusBadge>{question.style}</StatusBadge>
        {multiple ? <StatusBadge tone="warning">Select all that apply</StatusBadge> : null}
      </div>
      <fieldset className="question-options">
        <legend className="question-prompt">{question.prompt}</legend>
        {question.options.map((option) => (
          <label key={option.key} className="answer-option">
            <input required={!multiple} type={multiple ? "checkbox" : "radio"} name="answer" value={option.key} />
            <span className="answer-option__key">{option.key}</span><span className="answer-option__text">{option.text}</span>
          </label>
        ))}
      </fieldset>
      <fieldset className="confidence-field">
        <legend>How confident are you?</legend>
        <div className="confidence-options">
          {(["LOW", "MEDIUM", "HIGH"] as const).map((confidence) => <label key={confidence} className="confidence-option"><input className="sr-only" type="radio" name="confidence" value={confidence} required />{confidence}</label>)}
        </div>
      </fieldset>
      <ArcadeButton className="w-full">Submit answer <ArcadeIcon name="arrow" width={17} height={17} /></ArcadeButton>
    </form>
  );
}
