# Content Authoring Guide

AWS Quest stores curated learning content as JSON seed files. Runtime users never generate questions with AI.

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

## Seed behavior

`pnpm db:seed` validates the complete content bundle before writing to the database. Questions are upserted by stable code. Options and tags are replaced from the current source definition so repeated seeds remain deterministic.
