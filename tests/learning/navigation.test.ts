import assert from "node:assert/strict";
import test from "node:test";
import { mistakesHref, newestFirstPage, parseMistakeFilters } from "../../src/lib/learning/mistakes";
import { recommendNext } from "../../src/lib/learning/recommendation";

test("mistake filters ignore malformed values", () => {
  assert.deepEqual(parseMistakeFilters({ certification: "saa'; drop", domain: "../x", source: "bogus", page: "-2", session: "abc" }), {
    certification: null,
    domain: null,
    source: "ALL",
    sessionId: null,
    confidentOnly: false,
    page: 1,
  });
});

test("a session filter implies practice answers", () => {
  const filters = parseMistakeFilters({ certification: "SAA-C03", session: "12", source: "mock" });
  assert.equal(filters.source, "PRACTICE");
  assert.equal(filters.sessionId, 12);
});

test("changing a filter returns to page 1 and changing certification clears domain and session", () => {
  const current = parseMistakeFilters({ certification: "SAA-C03", domain: "design-secure-architectures", session: "4", page: "3" });
  assert.equal(mistakesHref(current, { confidentOnly: true }), "/mistakes?certification=SAA-C03&domain=design-secure-architectures&session=4&confident=1");
  assert.equal(mistakesHref(current, { certification: "CLF-C02" }), "/mistakes?certification=CLF-C02&source=PRACTICE");
  assert.equal(mistakesHref(current, { page: 2 }), "/mistakes?certification=SAA-C03&domain=design-secure-architectures&session=4&page=2");
});

test("pages merge attempt and mock misses newest first", () => {
  const at = (n: number) => ({ id: n, at: new Date(Date.UTC(2026, 0, n)) });
  const attempts = [at(9), at(5), at(1)];
  const mocks = [at(8), at(4)];
  assert.deepEqual(newestFirstPage([attempts, mocks], 1, 2).map((item) => item.id), [9, 8]);
  assert.deepEqual(newestFirstPage([attempts, mocks], 2, 2).map((item) => item.id), [5, 4]);
  assert.deepEqual(newestFirstPage([attempts, mocks], 3, 2).map((item) => item.id), [1]);
});

const nextConcept = { slug: "iam-basics", name: "IAM basics" };

test("due reviews come first and resume an open session", () => {
  const next = recommendNext({ code: "CLF-C02", reviewDue: 2, started: 5, nextConcept, openSessionId: 7 });
  assert.equal(next.kind, "REVIEW");
  assert.equal(next.href, "/practice/CLF-C02?session=7");
});

test("with nothing due, the next unstarted lesson is recommended", () => {
  assert.deepEqual(recommendNext({ code: "CLF-C02", reviewDue: 0, started: 0, nextConcept, openSessionId: null }), {
    kind: "LEARN",
    href: "/learn/CLF-C02/iam-basics",
    label: "Start first lesson",
    reason: "Up next: IAM basics",
  });
});

test("once every lesson is started, practice is recommended", () => {
  const next = recommendNext({ code: "SAA-C03", reviewDue: 0, started: 40, nextConcept: null, openSessionId: null });
  assert.equal(next.kind, "PRACTICE");
  assert.equal(next.href, "/practice/SAA-C03");
});
