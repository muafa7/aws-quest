import { RetroPanel, StatusBadge } from "./retro-panel";
import { ArcadeIcon } from "./arcade-icon";
import type { OptionSnapshot } from "@/lib/learning/answers";
import { explanationDisclosure, reviewOptions, type AnswerRecord, type ReviewOption } from "@/lib/learning/feedback";

export function AnswerList({ rows }: { rows: ReviewOption[] }) {
  if (rows.length === 0) return <p className="feedback-answer__text">No answer</p>;
  return (
    <ul className="feedback-answer__list">
      {rows.map((row) => (
        <li key={row.key} className="feedback-answer__option">
          <span className="feedback-answer__key">{row.letter}</span>
          <span className="feedback-answer__text">{row.text}</span>
        </li>
      ))}
    </ul>
  );
}

function rowTone(row: ReviewOption) {
  if (row.correct) return "success";
  return row.selected ? "danger" : "neutral";
}

export function OptionBreakdown({ rows, sourceUrl }: { rows: ReviewOption[]; sourceUrl?: string | null }) {
  return (
    <>
      <h3 className="option-breakdown__title">Every option</h3>
      <ul className="option-breakdown">
        {rows.map((row) => (
          <li key={row.key} className="option-breakdown__row" data-tone={rowTone(row)}>
            <div className="option-breakdown__top">
              <span className="feedback-answer__key">{row.letter}</span>
              <span className="feedback-answer__text">{row.text}</span>
              <span className="status-badges">
                {row.selected ? <StatusBadge tone={row.correct ? "success" : "danger"}>Your choice</StatusBadge> : null}
                {row.correct ? <StatusBadge tone="success">Correct</StatusBadge> : null}
              </span>
            </div>
            {row.explanation ? <p lang="id" className="option-breakdown__note">{row.explanation}</p> : null}
          </li>
        ))}
      </ul>
      {!rows.some((row) => row.explanation) ? <p className="option-breakdown__fallback">This question has no per-option notes; the concept review covers the distinction.</p> : null}
      {sourceUrl ? <a href={sourceUrl} target="_blank" rel="noreferrer" aria-label="Verify in AWS documentation (opens in a new tab)" className="text-link mt-3">Verify in AWS documentation <ArcadeIcon name="external" width={15} height={15} /></a> : null}
    </>
  );
}

function headline(isCorrect: boolean, confidence: string | null) {
  if (isCorrect && confidence === "LOW") return "Correct, but you were unsure. Check why it is right.";
  if (isCorrect && confidence === "HIGH") return "Answer recorded. Open the explanation if any part was a guess.";
  if (isCorrect) return "Answer recorded.";
  if (confidence === "HIGH") return "A confident miss often means a misconception. Compare every option below.";
  return "This concept needs another pass.";
}

export function AttemptFeedback({ attempt, options, explanation, keyNote, sourceUrl }: {
  attempt: AnswerRecord & { questionTextSnapshot?: string | null };
  /** Current options, used when the attempt predates option snapshots. */
  options: OptionSnapshot[];
  explanation: string;
  keyNote: string | null;
  sourceUrl?: string | null;
}) {
  const rows = reviewOptions(attempt, options);
  const { expanded, keyNoteVisible } = explanationDisclosure(attempt.isCorrect, attempt.confidence);
  const keyNoteOutside = Boolean(keyNote) && keyNoteVisible && !expanded;

  return (
    <RetroPanel accent tone={attempt.isCorrect ? "success" : "danger"}>
      <div className="feedback-header">
        <div className="feedback-header__title">
          <span className="feedback-header__icon"><ArcadeIcon name={attempt.isCorrect ? "check" : "close"} /></span>
          <div><h2>{attempt.isCorrect ? "Correct answer" : "Incorrect answer"}</h2><p>{headline(attempt.isCorrect, attempt.confidence)}</p></div>
        </div>
        <StatusBadge tone={attempt.confidence === "HIGH" && !attempt.isCorrect ? "danger" : "neutral"}>Confidence: {attempt.confidence ?? "\u2014"}</StatusBadge>
      </div>
      {attempt.questionTextSnapshot ? (
        <div className="feedback-context"><p className="feedback-context__label">Question</p><p className="feedback-context__prompt">{attempt.questionTextSnapshot}</p></div>
      ) : null}
      <div className="feedback-answer-grid">
        <dl className="feedback-answer" data-tone={attempt.isCorrect ? "success" : "danger"}><dt>Your answer</dt><dd><AnswerList rows={rows.filter((row) => row.selected)} /></dd></dl>
        {!attempt.isCorrect ? <dl className="feedback-answer" data-tone="success"><dt>Correct answer</dt><dd><AnswerList rows={rows.filter((row) => row.correct)} /></dd></dl> : null}
      </div>
      {keyNoteOutside ? <div className="key-note mt-5"><p className="key-note__label">Key Note</p><p className="key-note__text" lang="id">{keyNote}</p></div> : null}
      <details className="feedback-details" open={expanded}>
        <summary>{expanded ? "Explanation and answer breakdown" : "Show explanation and answer breakdown"}</summary>
        <div className="feedback-review"><h3>Concept Review</h3><p lang="id">{explanation}</p></div>
        {keyNote && !keyNoteOutside ? <div className="key-note mt-5"><p className="key-note__label">Key Note</p><p className="key-note__text" lang="id">{keyNote}</p></div> : null}
        <OptionBreakdown rows={rows} sourceUrl={sourceUrl} />
      </details>
    </RetroPanel>
  );
}
