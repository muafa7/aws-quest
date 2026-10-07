# AWS Quest

A retro developer-RPG style personal learning app for AWS certification preparation.

## Current scope

AWS Quest currently implements the V1 application shell for:

- AWS Certified Cloud Practitioner (CLF-C02)
- AWS Certified Solutions Architect – Associate (SAA-C03)
- short concept lessons
- immediate learn-mode challenges
- confidence-aware adaptive practice
- concept-level spaced review
- concept mastery tracking
- timed mock exams with blueprint-aware topic weighting
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

`pnpm db:setup` generates Prisma Client, syncs the local SQLite schema, and runs the idempotent seed pipeline.

## Useful commands

```bash
pnpm dev          # start Next.js in development
pnpm build        # production build
pnpm lint         # ESLint
pnpm typecheck    # TypeScript check
pnpm test:learning # learning-engine unit tests
pnpm db:generate  # generate Prisma Client
pnpm db:setup     # generate + db push + seed
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
/history
```

## Content authoring

Learning content lives under `prisma/seeds/` and is committed to Git. Stable certification codes, concept slugs, and question codes are used so the seeder can safely upsert content.

The included content is only a **development starter bank**. The product target remains roughly 400 CLF-C02 questions and 800 SAA-C03 questions, with quality and concept coverage taking priority over raw count.

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

The spaced-review MVP uses stages of 1, 3, 7, 14, 30, and 60 days. Mastery requires repeated retrieval rather than a single correct answer.

## Important

AWS Quest is a study application. Seed questions should be original and based on official AWS documentation and published certification scope. Do not add exam dumps, leaked questions, or claims that the mock score is an official AWS score.
