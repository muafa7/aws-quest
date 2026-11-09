import { RetroPanel, StatusBadge } from "./retro-panel";
import { ArcadeIcon } from "./arcade-icon";

type AnswerOption = { key: string; text: string };

function AnswerList({ keys, options }: { keys: string[]; options: AnswerOption[] }) {
  if (keys.length === 0) return <p className="feedback-answer__text">No answer</p>;
  return (
    <ul className="feedback-answer__list">
      {keys.map((key) => (
        <li key={key} className="feedback-answer__option">
          <span className="feedback-answer__key">{key}</span>
          <span className="feedback-answer__text">{options.find((option) => option.key === key)?.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function AttemptFeedback({ attempt, options, explanation, keyNote, }: {
  attempt: { isCorrect: boolean; confidence: string | null; selectedOptionsSnapshot: string; correctOptionsSnapshot: string };
  options: AnswerOption[];
  explanation: string;
  keyNote: string | null;
}) {
  const selected = JSON.parse(attempt.selectedOptionsSnapshot) as string[];
  const correct = JSON.parse(attempt.correctOptionsSnapshot) as string[];
  const showExplanation = !attempt.isCorrect || attempt.confidence === "LOW";
  const showKeyNote = showExplanation || (attempt.isCorrect && attempt.confidence === "MEDIUM");

  return (
    <RetroPanel accent tone={attempt.isCorrect ? "success" : "danger"}>
      <div className="feedback-header">
        <div className="feedback-header__title">
          <span className="feedback-header__icon"><ArcadeIcon name={attempt.isCorrect ? "check" : "close"} /></span>
          <div><h2>{attempt.isCorrect ? "Correct answer" : "Incorrect answer"}</h2><p>{attempt.isCorrect ? "Answer recorded." : "This concept needs another pass."}</p></div>
        </div>
        <StatusBadge tone={attempt.confidence === "HIGH" && !attempt.isCorrect ? "danger" : "neutral"}>Confidence: {attempt.confidence ?? "\u2014"}</StatusBadge>
      </div>
      {!attempt.isCorrect ? (
        <div className="feedback-answer-grid">
          <dl className="feedback-answer" data-tone="danger"><dt>Your answer</dt><dd><AnswerList keys={selected} options={options} /></dd></dl>
          <dl className="feedback-answer" data-tone="success"><dt>Correct answer</dt><dd><AnswerList keys={correct} options={options} /></dd></dl>
        </div>
      ) : null}
      {showExplanation ? <div className="feedback-review"><h3>Concept Review</h3><p lang="id">{explanation}</p></div> : null}
      {showKeyNote && keyNote ? <div className="key-note mt-5"><p className="key-note__label">Key Note</p><p className="key-note__text" lang="id">{keyNote}</p></div> : null}
    </RetroPanel>
  );
}
