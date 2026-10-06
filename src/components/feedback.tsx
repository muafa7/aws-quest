import { RetroPanel, StatusBadge } from "./retro-panel";

export function AttemptFeedback({
  attempt,
  explanation,
  keyNote,
}: {
  attempt: {
    isCorrect: boolean;
    confidence: string | null;
    selectedOptionsSnapshot: string;
    correctOptionsSnapshot: string;
  };
  explanation: string;
  keyNote: string | null;
}) {
  const selected = JSON.parse(attempt.selectedOptionsSnapshot) as string[];
  const correct = JSON.parse(attempt.correctOptionsSnapshot) as string[];
  const showExplanation = !attempt.isCorrect || attempt.confidence === "LOW";
  const showKeyNote = showExplanation || (attempt.isCorrect && attempt.confidence === "MEDIUM");

  return (
    <RetroPanel accent className={attempt.isCorrect ? "border-emerald-700/70" : "border-red-800/70"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={`text-2xl font-black tracking-[0.08em] ${attempt.isCorrect ? "text-emerald-300" : "text-red-300"}`}>
            {attempt.isCorrect ? "★ CLEAR! ★" : "NOT CLEARED"}
          </p>
          <p className="mt-1 text-sm text-slate-400">{attempt.isCorrect ? "Correct answer." : "This concept needs another pass."}</p>
        </div>
        <StatusBadge tone={attempt.confidence === "HIGH" && !attempt.isCorrect ? "danger" : "neutral"}>Confidence: {attempt.confidence ?? "—"}</StatusBadge>
      </div>

      {!attempt.isCorrect ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="border border-slate-700 bg-[#080d15] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Your answer</p>
            <p className="mt-2 font-bold text-red-300">{selected.length ? selected.join(", ") : "No answer"}</p>
          </div>
          <div className="border border-slate-700 bg-[#080d15] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Correct</p>
            <p className="mt-2 font-bold text-emerald-300">{correct.join(", ")}</p>
          </div>
        </div>
      ) : null}

      {showExplanation ? (
        <div className="mt-5 border-t border-slate-700 pt-5">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-300">Concept Review</p>
          <p className="mt-3 leading-7 text-slate-300">{explanation}</p>
        </div>
      ) : null}
      {showKeyNote && keyNote ? <p className="mt-4 border-l-2 border-amber-400 pl-3 text-sm text-amber-100">{keyNote}</p> : null}
    </RetroPanel>
  );
}
