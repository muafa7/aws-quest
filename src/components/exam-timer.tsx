"use client";

import { useEffect, useMemo, useState } from "react";

function format(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

export function ExamTimer({ startedAt, durationMinutes, formId }: { startedAt: string; durationMinutes: number; formId: string }) {
  const deadline = useMemo(() => new Date(startedAt).getTime() + durationMinutes * 60_000, [startedAt, durationMinutes]);
  const [remaining, setRemaining] = useState(() => Math.max(0, Math.ceil((deadline - Date.now()) / 1000)));

  useEffect(() => {
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        window.clearInterval(timer);
        const form = document.getElementById(formId) as HTMLFormElement | null;
        form?.requestSubmit();
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [deadline, formId]);

  return <span className={remaining < 300 ? "font-black text-red-300" : "font-black text-amber-300"}>{format(remaining)}</span>;
}
