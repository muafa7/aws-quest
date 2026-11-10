# AWS Quest

A retro developer-RPG style personal learning app for AWS certification preparation.

## Current scope

AWS Quest currently implements the V1 application shell for:

- AWS Certified Cloud Practitioner (CLF-C02)
- AWS Certified Solutions Architect – Associate (SAA-C03)
- short concept lessons
- immediate learn-mode challenges, with an optional "try from memory" mode
- confidence-aware adaptive practice with resumable sessions and a session recap
- answer review with the original question, shuffled-option letters, and per-option explanations
- a mistakes page filtered by certification, domain, source, session and confidence
- concept-level spaced review
- concept mastery tracking
- timed mock exams sampled by the domain blueprint, with shuffled questions and options, autosaved answers and flags, a question map, resume, a submit confirmation, and a full answer review
- one-time sealed fresh mocks built from reserved assessment packs
- certification progress and activity history

The app intentionally has **no runtime AI dependency**, no separate backend service, and no authentication in V1.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM 7.10
- `@prisma/adapter-better-sqlite3`
- SQLite
- Zod
- pnpm

## Local development

Requirements:

- Node.js 22+
- Corepack / pnpm

```bash
corepack enable
pnpm install
cp .env.example .env
pnpm db:setup
pnpm dev
```

Then open `http://localhost:3000`.

`pnpm db:setup` generates Prisma Client, applies the migrations in `prisma/migrations`, and runs the idempotent seed pipeline.

### Upgrading a database created with `db push`

Databases created before migrations existed have the `0_init` schema but no migration history. Stop the app, back up the SQLite file, then mark the baseline as applied and deploy the additive migrations:

```bash
pnpm exec prisma migrate resolve --applied 0_init
pnpm db:deploy
pnpm db:seed
```

All migrations after `0_init` only add nullable or defaulted columns and indexes; existing attempts, progress and mock history are kept.

## Useful commands

```bash
pnpm dev          # start Next.js in development
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test         # unit + content-validation tests
pnpm test:learning # learning-engine unit tests only
pnpm test:db      # migrations + seed + selection checks on a throwaway SQLite file
pnpm db:generate  # generate Prisma Client
pnpm db:deploy    # apply pending migrations
pnpm db:setup     # generate + migrate deploy + seed
pnpm db:seed      # re-run idempotent content seeds
pnpm content:validate # validate seed JSON and print coverage stats (no database writes)
pnpm db:studio    # Prisma Studio
```

## Main routes

```text
/
/learn
/learn/[certification]
/learn/[certification]/[concept]
/practice
/practice/[certification]
/mock
/mock/[certification]
/mock/[certification]/[examId]
/progress
/progress/[certification]
/mistakes
/history
```

## Content authoring

Learning content lives under `prisma/seeds/` and is committed to Git. Stable certification codes, concept slugs, and question codes are used so the seeder can safely upsert content.

The bank contains 415 CLF-C02 questions and 400 SAA-C03 questions. SAA-C03 splits into 270 training questions and 130 reserved questions in two sealed 65-question assessment packs, which never appear in Learn, Practice or standard mocks. The product target remains roughly 800 SAA-C03 questions; 19 SAA concepts still have fewer than 3 training questions and cannot reach mastery until expanded.

See:

- [`docs/product-spec.md`](docs/product-spec.md)
- [`docs/content-authoring.md`](docs/content-authoring.md)
- [`docs/CONTENT_INVENTORY.md`](docs/CONTENT_INVENTORY.md)

## Learning engine notes

Regular practice prioritizes, in broad order:

1. wrong answers with high confidence (possible misconception)
2. concepts whose review is due
3. low-accuracy concepts
4. correct answers with low confidence
5. unseen concepts
6. medium/mastered concepts at lower priority

Question selection prefers an unseen question from the chosen concept, then a question outside the recent-question window, before allowing an exact repeat.

The spaced-review MVP uses stages of 1, 3, 7, 14, 30, and 60 days. A correct answer before the review is due keeps the current stage and due date, so answering several questions in one sitting cannot inflate the interval. A wrong answer lowers the stage and never pushes a pending review later.

Mock exams allow one active exam per certification, enforced by a unique key in the database. Answers and flags autosave; the server checks the submit time against the deadline (30-second grace) and records the exam as on time or late, and only the first submission is graded. Each mock question records whether it had never been answered in AWS Quest when the exam started, so first-sight accuracy can be separated from repeats. A sealed pack can be started once and is refused if any of its questions was already shown.

A concept is cleared only from Practice, where the lesson is not on screen: the last three Practice answers must be correct, not LOW confidence, on three different questions, and span at least two days. Learn answers still schedule reviews but never clear a concept. Concepts cleared under the earlier rule keep their status until the next wrong answer.

## Important

AWS Quest is a study application. Seed questions should be original and based on official AWS documentation and published certification scope. Do not add exam dumps, leaked questions, or claims that the mock score is an official AWS score.
