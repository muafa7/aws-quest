import { submitLearningAnswer } from "@/app/_actions/learning";
import { optionLetter, shuffled } from "@/lib/learning/answers";
import type { SafeQuestion } from "@/lib/learning/types";
import { StatusBadge } from "./retro-panel";
import { ArcadeButton } from "./arcade-button";
import { ArcadeIcon } from "./arcade-icon";

export function QuestionForm({ question, certification, mode, sessionId, conceptSlug, recall }: {
  question: SafeQuestion;
  certification: string;
  mode: "LEARN" | "PRACTICE";
  sessionId?: number;
  conceptSlug?: string;
  recall?: boolean;
}) {
  const multiple = question.type === "MULTIPLE_CHOICE";
  // Letters are positional, so the correct answer is not always "A". The shown order is
  // submitted with the answer and stored on the attempt for faithful review later.
  const options = shuffled(question.options);

  return (
    <form action={submitLearningAnswer} className="question-form">
      <input type="hidden" name="certification" value={certification} />
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="mode" value={mode} />
      {sessionId ? <input type="hidden" name="sessionId" value={sessionId} /> : null}
      {conceptSlug ? <input type="hidden" name="conceptSlug" value={conceptSlug} /> : null}
      {recall ? <input type="hidden" name="recall" value="1" /> : null}
      {options.map((option) => <input key={option.key} type="hidden" name="optionOrder" value={option.key} />)}
      <div className="question-tags">
        <StatusBadge>{question.difficulty}</StatusBadge>
        <StatusBadge>{question.style}</StatusBadge>
        {multiple ? <StatusBadge tone="warning">Select all that apply</StatusBadge> : null}
      </div>
      <fieldset className="question-options">
        <legend className="question-prompt">{question.prompt}</legend>
        {options.map((option, index) => (
          <label key={option.key} className="answer-option">
            <input required={!multiple} type={multiple ? "checkbox" : "radio"} name="answer" value={option.key} />
            <span className="answer-option__key">{optionLetter(index)}</span><span className="answer-option__text">{option.text}</span>
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
