import { submitLearningAnswer } from "@/app/_actions/learning";
import type { SafeQuestion } from "@/lib/learning/types";
import { StatusBadge } from "./retro-panel";

export function QuestionForm({
  question,
  certification,
  mode,
  sessionId,
  conceptSlug,
}: {
  question: SafeQuestion;
  certification: string;
  mode: "LEARN" | "PRACTICE";
  sessionId?: number;
  conceptSlug?: string;
}) {
  const multiple = question.type === "MULTIPLE_CHOICE";

  return (
    <form action={submitLearningAnswer} className="space-y-6">
      <input type="hidden" name="certification" value={certification} />
      <input type="hidden" name="questionId" value={question.id} />
      <input type="hidden" name="mode" value={mode} />
      {sessionId ? <input type="hidden" name="sessionId" value={sessionId} /> : null}
      {conceptSlug ? <input type="hidden" name="conceptSlug" value={conceptSlug} /> : null}

      <div className="flex flex-wrap gap-2">
        <StatusBadge>{question.difficulty}</StatusBadge>
        <StatusBadge>{question.style}</StatusBadge>
        {multiple ? <StatusBadge tone="warning">Select all that apply</StatusBadge> : null}
      </div>

      <fieldset className="space-y-3">
        <legend className="mb-5 text-lg font-semibold leading-8 text-slate-100">{question.prompt}</legend>
        {question.options.map((option) => (
          <label key={option.key} className="group flex cursor-pointer gap-3 border border-slate-700 bg-[#080d15] p-4 transition hover:border-amber-500/70 hover:bg-amber-400/[0.03]">
            <input
              required={!multiple}
              type={multiple ? "checkbox" : "radio"}
              name="answer"
              value={option.key}
              className="mt-1 accent-amber-400"
            />
            <span className="grid h-6 min-w-6 place-items-center border border-slate-600 text-xs font-bold text-amber-300">{option.key}</span>
            <span className="leading-6 text-slate-300 group-hover:text-slate-100">{option.text}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">How confident are you?</legend>
        <div className="grid grid-cols-3 gap-2">
          {(["LOW", "MEDIUM", "HIGH"] as const).map((confidence) => (
            <label key={confidence} className="cursor-pointer border border-slate-700 bg-[#080d15] p-3 text-center text-xs font-bold text-slate-300 has-[:checked]:border-amber-400 has-[:checked]:bg-amber-400/10 has-[:checked]:text-amber-300">
              <input className="sr-only" type="radio" name="confidence" value={confidence} required />
              {confidence}
            </label>
          ))}
        </div>
      </fieldset>

      <button className="retro-button w-full border border-amber-400 bg-amber-400 px-4 py-3 text-sm font-black tracking-[0.14em] text-slate-950 shadow-[4px_4px_0_#78350f] transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0_#78350f]">
        SUBMIT ANSWER
      </button>
    </form>
  );
}
