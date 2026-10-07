# Content Authoring Guide

AWS Quest stores curated learning content as JSON seed files. Runtime users never generate questions with AI.

Per-certification taxonomy, planned allocation and code prefixes live in [`CONTENT_INVENTORY.md`](CONTENT_INVENTORY.md).

## Stable identifiers

- Certification: `CLF-C02`, `SAA-C03`
- Concept: stable slug, e.g. `clf-shared-responsibility`
- Question: stable code, e.g. `CCP-SRM-001`

Never reference generated database IDs from seed files.

## Question rules

1. Questions must be original and based on the official AWS scope/documentation.
2. Do not copy exam dumps or leaked exam questions.
3. `SINGLE_CHOICE` must have exactly one correct option.
4. `MULTIPLE_CHOICE` must have at least two correct options.
5. Reuse a concept with different scenarios instead of repeating identical questions.
6. Prefer English for questions/options and Bahasa Indonesia for lessons/explanations.
7. Keep source links where practical so answers can be audited later.

## Authoring conventions

1. Never delete or reuse a question code. Retire a question with `"active": false`; the seeder never deletes rows, and attempts keep referencing old questions.
2. Within a concept, the lowest unseen code is served first. Number questions in learning order, starting with an easy entry question.
3. Every active concept needs a lesson (Learn returns 404 without one) and at least 4 active questions (mastery needs 3 distinct questions).
4. One code prefix (e.g. `CCP-SRM`) belongs to exactly one concept.
5. Feedback shows the concept explanation, not a per-question explanation. A comparison question belongs to the concept that is its correct answer, and that concept's explanation must name the contrast.
6. `MULTIPLE_CHOICE` prompts state how many answers to pick, e.g. `(Select TWO.)`, matching the number of correct options.
7. Distractors should be plausible options from the same content area.
8. Options are shown in key order, so balance correct-answer positions across a bank.
9. Name question files after the domain's topic slug, e.g. `questions/security-compliance.json`.

## Seed behavior

`pnpm db:seed` validates every certification bundle before writing to the database, so one invalid file blocks the whole seed. Questions are upserted by stable code. Options and tags are replaced from the current source definition so repeated seeds remain deterministic.

`pnpm content:validate` runs the same checks without touching the database and prints per-domain, per-concept, style, difficulty, type and correct-key counts. Validation rejects unknown JSON keys, blank strings, unknown references, duplicate slugs, codes, lessons, option keys and tags, active concepts without a lesson, malformed codes, a code prefix shared by two concepts, `(Select N.)` mismatches, and questions placed in a file for another domain. Correct-key distribution and concepts with fewer than 4 questions are reported but do not fail validation.
