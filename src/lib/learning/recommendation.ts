export type Recommendation = { href: string; label: string; reason: string; kind: "REVIEW" | "LEARN" | "PRACTICE" };

/** One clear next step per certification: due reviews first, then new lessons, then practice. */
export function recommendNext({ code, reviewDue, started, nextConcept, openSessionId }: {
  code: string;
  reviewDue: number;
  started: number;
  nextConcept: { slug: string; name: string } | null;
  openSessionId: number | null;
}): Recommendation {
  const practiceHref = openSessionId ? `/practice/${code}?session=${openSessionId}` : `/practice/${code}`;
  if (reviewDue > 0) {
    return { kind: "REVIEW", href: practiceHref, label: "Clear reviews", reason: `${reviewDue} concept${reviewDue === 1 ? " is" : "s are"} due for review. Practice brings them up first.` };
  }
  if (nextConcept) {
    return { kind: "LEARN", href: `/learn/${code}/${nextConcept.slug}`, label: started === 0 ? "Start first lesson" : "Next lesson", reason: `Up next: ${nextConcept.name}` };
  }
  return { kind: "PRACTICE", href: practiceHref, label: openSessionId ? "Resume practice" : "Practice", reason: "Every lesson is started. Practice from memory to clear concepts." };
}
