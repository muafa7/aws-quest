export const MISTAKES_PER_PAGE = 20;

export const mistakeSources = ["ALL", "LEARN", "PRACTICE", "MOCK"] as const;
export type MistakeSource = (typeof mistakeSources)[number];

export type MistakeFilters = {
  certification: string | null;
  domain: string | null;
  source: MistakeSource;
  sessionId: number | null;
  confidentOnly: boolean;
  page: number;
};

type Query = Record<string, string | string[] | undefined>;

function single(query: Query, key: string) {
  const value = query[key];
  return typeof value === "string" ? value : undefined;
}

function positiveInt(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function parseMistakeFilters(query: Query): MistakeFilters {
  const certification = single(query, "certification");
  const domain = single(query, "domain");
  const source = single(query, "source")?.toUpperCase();
  const sessionId = positiveInt(single(query, "session"));
  return {
    certification: certification && /^[A-Z0-9-]+$/.test(certification) ? certification : null,
    domain: domain && /^[a-z0-9-]+$/.test(domain) ? domain : null,
    // A practice session only contains practice answers.
    source: sessionId ? "PRACTICE" : mistakeSources.find((option) => option === source) ?? "ALL",
    sessionId,
    confidentOnly: single(query, "confident") === "1",
    page: positiveInt(single(query, "page")) ?? 1,
  };
}

/** Builds a filter link; any change other than paging returns to page 1. */
export function mistakesHref(current: MistakeFilters, change: Partial<MistakeFilters>) {
  const next = { ...current, ...change, page: change.page ?? 1 };
  if (change.certification && change.certification !== current.certification) {
    next.domain = null;
    next.sessionId = null;
  }
  if (change.source && change.source !== "PRACTICE") next.sessionId = null;
  const params = new URLSearchParams();
  if (next.certification) params.set("certification", next.certification);
  if (next.domain) params.set("domain", next.domain);
  if (next.source !== "ALL" && !next.sessionId) params.set("source", next.source);
  if (next.sessionId) params.set("session", String(next.sessionId));
  if (next.confidentOnly) params.set("confident", "1");
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/mistakes?${query}` : "/mistakes";
}

/**
 * Pages through several newest-first lists as one. Each list must already hold its
 * newest `page * perPage` rows, which is enough to fill any requested page.
 */
export function newestFirstPage<T extends { at: Date }>(lists: readonly T[][], page: number, perPage = MISTAKES_PER_PAGE) {
  return lists
    .flat()
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice((page - 1) * perPage, page * perPage);
}
