export function ProgressBar({ value, label }: { value: number; label?: string }) {
  const safe = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div>
      {label ? <div className="mb-2 flex justify-between text-xs text-slate-400"><span>{label}</span><span>{safe}%</span></div> : null}
      <div className="h-3 border border-slate-700 bg-[#06090f] p-[2px]">
        <div className="h-full bg-amber-400 transition-all" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
