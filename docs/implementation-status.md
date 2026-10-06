# AWS Quest — Implementation Status

This document summarizes what is implemented in the current V1 development slice and what remains content/product work.

## Implemented

### Foundation

- Next.js full-stack application
- TypeScript + Tailwind CSS
- Prisma ORM + SQLite driver adapter
- Idempotent JSON content seeding
- Stable certification, concept, and question identifiers
- Seed validation for option/correct-answer constraints

### Learn Mode

- Certification campaign selection
- Topic/stage map
- Split lesson + challenge layout on desktop
- Stacked responsive layout on smaller screens
- Immediate challenge after a short lesson
- Confidence selection
- Correct/incorrect feedback behavior
- Concept explanation and key-note feedback

### Practice Mode

- Unlimited practice sessions
- Optional checkpoint every 10 questions
- Confidence-aware answer tracking
- Server-side correctness validation
- Concept-level priority scoring
- Review-due prioritization
- Weak-accuracy prioritization
- Wrong + high-confidence misconception priority
- Unseen-question preference
- Recent exact-question avoidance
- Concept-level spaced review stages
- Dynamic mastery state

### Mock Exam

- Timed exam records
- Certification-specific duration
- No confidence input
- No immediate correctness feedback
- Topic-weight-aware question allocation
- Automatic timer submission in the browser
- Overall internal practice score
- Domain breakdown
- Weak-concept recommendations

### Progress / History

- Campaign mastery summary
- Concept attempt counts and accuracy
- Review stage / due date
- Cleared / due / training / new states
- Recent regular attempts
- Practice-session history
- Mock-exam history

## Starter Content

The repository intentionally contains only a small development bank:

- CLF-C02: 2 concepts, 6 questions
- SAA-C03: 1 concept, 3 questions

This is enough to exercise multiple-question retrieval within each implemented concept. It is not intended to represent full certification coverage.

## Remaining V1 Work

The largest remaining task is content, not application architecture:

- complete CLF-C02 topic/concept taxonomy
- complete SAA-C03 topic/concept taxonomy
- write and review short lessons for all concepts
- grow the original question bank toward ~400 CLF-C02 / ~800 SAA-C03 questions
- verify each concept and question against current official AWS documentation
- tune adaptive priority weights using real study sessions
- improve mock question allocation when the bank becomes large enough for full blueprint quotas
- add broader automated tests around database-backed practice and mock flows
- run final accessibility and mobile visual QA

## Validation Note

The source was statically checked in the build environment and the pure spaced-review engine was executed with unit assertions. A full `pnpm install`, Prisma generation, and `next build` could not be run in that environment because outbound npm registry access was unavailable. Run the commands below on a normal development machine before merging/deploying:

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:setup
pnpm test:learning
pnpm typecheck
pnpm lint
pnpm build
```
