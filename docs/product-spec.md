# AWS Certification Practice App — Product & Technical Specification

## 1. Overview

A personal AWS certification learning application focused on:

- AWS Certified Cloud Practitioner (CLF-C02)
- AWS Certified Solutions Architect – Associate (SAA-C03)

The application combines:

- short concept-based lessons,
- immediate practice,
- adaptive question selection,
- spaced review,
- confidence tracking,
- concept mastery,
- mock exams,
- and a retro-game-inspired learning experience.

The product should feel closer to **Boot.dev + retro RPG / developer terminal UI** than a traditional LMS or SaaS dashboard.

The application does **not** require AI at runtime.

---

## 2. Main Objective

Build a lightweight personal study app that helps the learner:

1. Understand AWS concepts through short lessons.
2. Practice immediately after learning.
3. Revisit weak concepts automatically.
4. Avoid repeated identical questions.
5. Re-test the same concept using different scenarios.
6. Track confidence in addition to correctness.
7. Prepare for real AWS certification exam conditions through mock exams.
8. Maintain a large curated question bank through seed files.

---

## 3. Target Certifications

### CLF-C02

AWS Certified Cloud Practitioner.

Initial target question bank:

- approximately 400 questions.

### SAA-C03

AWS Certified Solutions Architect – Associate.

Initial target question bank:

- approximately 800 questions.

### Total Target

Approximately:

```text
CLF-C02   ~400 questions
SAA-C03   ~800 questions
-----------------------
TOTAL     ~1,200 questions
```

Question count is a target, not a strict requirement.

Quality and concept coverage take priority over hitting the exact number.

---

## 4. Core Product Principles

### 4.1 No AI Runtime Dependency

The production learning experience must not require AI.

The following are deterministic:

- question selection,
- answer validation,
- mastery calculation,
- weak-topic detection,
- review scheduling,
- explanations,
- progress tracking,
- mock exam generation.

AI may optionally be used during development to help draft content, but all content must be stored and reviewed before being used by the application.

---

### 4.2 Retrieval Before Re-reading

Practice should be the main learning mechanism.

The system should favor:

```text
Short lesson
→ Question
→ Feedback
→ Later retrieval
→ Different question
→ Same concept
```

instead of:

```text
Long lesson
→ Long lesson
→ Long lesson
→ Quiz at the end
```

---

### 4.3 Concepts Are More Important Than Questions

Questions belong to concepts.

Example:

```text
Concept:
Shared Responsibility Model

Questions:
- EC2 guest OS patching
- RDS infrastructure patching
- Physical data center security
- Customer application responsibility
- S3 access configuration
```

The application reviews the **concept**, not the exact question.

If a concept needs to be tested again, the system should prefer another unused question from the same concept.

---

### 4.4 No Immediate Exact Repetition

The same exact question should not normally be shown twice during regular practice.

A previously seen question may only be reused when:

- the concept has exhausted available unused questions,
- enough time has passed,
- or the application explicitly enters a review mode that permits question reuse.

---

## 5. Product Modes

The main application has three primary learning modes:

```text
LEARN
PRACTICE
MOCK EXAM
```

A separate Review experience may be surfaced inside Practice rather than becoming a mandatory top-level mode.

---

# 6. Learn Mode

## 6.1 Purpose

Learn Mode is used when studying a concept for the first time or intentionally revisiting a concept.

The experience should follow the Boot.dev-style approach:

```text
Short explanation
→ Immediate question
→ Feedback
→ Continue
```

---

## 6.2 Desktop Layout

Use a split-screen layout.

```text
┌──────────────────────────────┬───────────────────────────────┐
│ LESSON                       │ CHALLENGE                     │
│                              │                               │
│ Shared Responsibility Model  │ A company runs an app on     │
│                              │ Amazon EC2...                 │
│ AWS manages security         │                               │
│ OF the cloud.                │ Who patches the guest OS?     │
│                              │                               │
│ Customers manage security    │ A. AWS                        │
│ IN the cloud.                │ B. Customer                   │
│                              │ C. AWS Support                │
│ Key Note                     │ D. Hardware Vendor            │
│ EC2 → Customer manages OS    │                               │
│                              │ [ Submit ]                    │
└──────────────────────────────┴───────────────────────────────┘
```

---

## 6.3 Mobile Layout

On small screens:

```text
Lesson
↓
Question
↓
Feedback
```

Do not force side-by-side layout on mobile.

---

## 6.4 Lesson Length

Lessons should be intentionally short.

Recommended reading time:

```text
1–3 minutes per concept
```

A lesson should generally contain:

- concept title,
- short explanation,
- important rules,
- comparison where relevant,
- key note.

Avoid long article-style content.

---

# 7. Practice Mode

## 7.1 Purpose

Practice Mode is the primary adaptive learning experience.

It should continuously select the next useful question based on:

- review due,
- weak concepts,
- previous mistakes,
- confidence,
- concept exposure,
- mastery,
- recent question history.

There is no fixed daily question limit.

---

## 7.2 Unlimited Session

Users may continue answering as many questions as they want.

Example:

```text
Q1
Q2
Q3
...
Q17
...
```

Provide optional session checkpoints every 10 questions.

Example:

```text
SESSION CHECKPOINT

10 answered
8 correct
2 incorrect

[ Continue ]
[ Finish Session ]
```

The checkpoint is informational only.

It must not force the session to end.

---

# 8. Confidence

Every regular practice answer includes confidence.

Available values:

```text
LOW
MEDIUM
HIGH
```

Confidence is used together with correctness.

It must never replace actual performance.

---

## 8.1 Interpretation

### Correct + High

Strong positive signal.

### Correct + Medium

Likely understood, but not fully stable.

### Correct + Low

Possible guess or weak understanding.

Needs earlier review.

### Wrong + Low

Knowledge gap.

### Wrong + Medium

Weak or incomplete understanding.

### Wrong + High

Potential misconception.

This receives the highest review priority.

---

# 9. Feedback Rules

AI-generated explanations are not required.

Explanations come from the Concept record.

---

## 9.1 Correct + High Confidence

Display only minimal confirmation.

```text
CORRECT

Confidence: HIGH

[ Continue ]
```

---

## 9.2 Correct + Medium Confidence

Display:

- correct state,
- optional key note.

---

## 9.3 Correct + Low Confidence

Display:

- correct state,
- general concept explanation,
- key note.

---

## 9.4 Wrong Answer

Display:

- incorrect state,
- selected answer,
- correct answer,
- general concept explanation,
- key note.

---

## 9.5 Wrong + High Confidence

Additionally mark the attempt internally as a possible misconception.

This concept receives very high review priority.

---

# 10. Adaptive Question Selection

## 10.1 Selection Priority

Recommended conceptual priority:

```text
1. Wrong + High Confidence
2. Review Due
3. Low Accuracy Concept
4. Correct + Low Confidence
5. New / Untested Concept
6. Medium Mastery Concept
7. Mastered Concept
```

---

## 10.2 Example Priority Weights

Initial implementation may use a simple scoring model:

```text
Wrong + High Confidence   +10
Wrong + Medium             +8
Wrong + Low                +6

Review Due                 +6
Low Concept Accuracy       +5
Correct + Low Confidence   +5
Never Tested Concept       +3
Correct + Medium           +2

Recently Asked             -3
Mastered                   -5
```

These values are product heuristics and may be tuned later.

---

# 11. Interleaving

Do not group too many questions from the same service or concept.

Avoid:

```text
S3
S3
S3
S3
EC2
EC2
EC2
```

Prefer:

```text
S3
IAM
EC2
RDS
Shared Responsibility
S3
CloudFront
IAM
```

The system should especially mix concepts that learners commonly confuse.

Examples:

```text
S3 vs EBS vs EFS
Security Group vs NACL
SNS vs SQS vs EventBridge
CloudWatch vs CloudTrail
Multi-AZ vs Read Replica
ALB vs NLB
Shield vs WAF
RDS vs DynamoDB
```

---

# 12. Spaced Review

## 12.1 Concept-Based Review

Review is scheduled at the concept level.

Do not schedule only the exact question.

---

## 12.2 Initial Review Stages

Simple MVP schedule:

```text
Stage 0 → 1 day
Stage 1 → 3 days
Stage 2 → 7 days
Stage 3 → 14 days
Stage 4 → 30 days
Stage 5 → 60 days
```

---

## 12.3 Progression

If performance is strong:

```text
Stage N
→ Stage N + 1
```

If performance is weak:

```text
Stage N
→ lower stage
```

A Wrong + High Confidence result may reset the concept more aggressively.

---

# 13. Concept Mastery

A concept must not become mastered after one correct answer.

Recommended mastery criteria:

```text
- at least 3 different questions answered,
- successful retrieval across multiple sessions,
- successful retrieval across multiple dates,
- recent confidence is Medium or High,
- recent accuracy remains strong.
```

Example:

```text
Oct 1
Question A
Correct / Medium

Oct 4
Question B
Correct / High

Oct 12
Question C
Correct / High

→ MASTERED
```

---

# 14. Mock Exam

Mock Exam must behave differently from Practice Mode.

---

## 14.1 Characteristics

Mock Exam:

- fixed question count,
- timed,
- no immediate feedback,
- no lesson panel,
- no confidence input,
- blueprint-weighted question distribution,
- result only after submission/end.

---

## 14.2 Exam Structure

### CLF-C02

Target:

```text
65 questions
90 minutes
```

### SAA-C03

Target:

```text
65 questions
130 minutes
```

---

## 14.3 Results

Show:

- overall score,
- correct count,
- incorrect count,
- accuracy per domain,
- weakest concepts,
- recommended review concepts.

Do not attempt to claim an official AWS score.

The app score is only an internal practice score.

---

# 15. Question Bank

## 15.1 Source Philosophy

Question content should be:

- original,
- based on official AWS exam scope,
- verified against AWS documentation,
- not copied from exam dumps,
- not presented as leaked real certification questions.

---

## 15.2 Language

Recommended:

### Questions and Options

English.

Reason:

AWS exam terminology includes wording such as:

```text
MOST cost-effective
LEAST operational overhead
highly available
fault tolerant
durable
decoupled
```

The learner should become comfortable with this language.

### Lessons and General Explanations

Bahasa Indonesia.

---

# 16. Question Types

Initial supported types:

```text
SINGLE_CHOICE
MULTIPLE_CHOICE
```

---

## 16.1 Question Styles

Recommended metadata:

```text
BASIC
UNDERSTANDING
COMPARISON
SCENARIO
ARCHITECTURE
```

Example progression:

```text
Basic recognition
→ Understanding
→ Comparison
→ Scenario
→ Architecture decision
```

SAA questions should contain significantly more Scenario and Architecture styles than CCP.

---

# 17. Difficulty

Supported difficulty:

```text
EASY
MEDIUM
HARD
```

Difficulty should describe cognitive difficulty, not only question length.

---

# 18. Technology Stack

Use a single Next.js application for both frontend and backend.

Recommended stack:

```text
Framework       Next.js
Language        TypeScript
UI              React
Styling         Tailwind CSS
Components      shadcn/ui where useful
ORM             Prisma
Database        SQLite initially
Validation      Zod
Deployment      Vercel or VPS
```

---

## 18.1 Why Next.js Full Stack

The project is personal and does not currently need a separate backend service.

Next.js can handle:

```text
Frontend
+
Server Components
+
Server Actions / Route Handlers
+
Learning Engine
+
Database Access
```

Avoid introducing NestJS, Redis, queues, microservices, or separate APIs unless future requirements justify them.

---

# 19. High-Level Architecture

```text
Browser
   │
   ▼
Next.js
   │
   ├── UI
   │   ├── Learn
   │   ├── Practice
   │   ├── Mock
   │   └── Progress
   │
   ├── Learning Engine
   │   ├── Question Selector
   │   ├── Mastery Calculator
   │   ├── Review Scheduler
   │   └── Mock Exam Generator
   │
   └── Prisma
        │
        ▼
      SQLite
```

Future database migration:

```text
SQLite
→ PostgreSQL
```

should be possible without changing the learning model.

---

# 20. No Admin Dashboard in V1

No question-management dashboard is required initially.

Question management happens through repository seed files.

```text
JSON Content
     ↓
Git
     ↓
Seeder
     ↓
Database
```

An admin dashboard may be added in the future if editing seed files becomes inconvenient.

---

# 21. Seed Architecture

Recommended structure:

```text
prisma/
├── schema.prisma
├── seed.ts
│
└── seeds/
    ├── clf-c02/
    │   ├── certification.json
    │   ├── topics.json
    │   ├── concepts.json
    │   ├── lessons.json
    │   └── questions/
    │       ├── cloud-concepts.json
    │       ├── security-compliance.json
    │       ├── cloud-services.json
    │       └── billing-pricing.json
    │
    └── saa-c03/
        ├── certification.json
        ├── topics.json
        ├── concepts.json
        ├── lessons.json
        └── questions/
            ├── secure-architectures.json
            ├── resilient-architectures.json
            ├── high-performing.json
            └── cost-optimized.json
```

---

# 22. Stable Content Identifiers

Do not reference content by generated integer IDs inside seed files.

Use stable codes and slugs.

Examples:

```text
Certification:
CLF-C02

Concept:
shared-responsibility-model

Question:
CCP-SRM-001
```

Database IDs may remain numeric internally.

---

# 23. Example Question Seed

```json
{
  "code": "CCP-SRM-001",
  "certification": "CLF-C02",
  "domain": "security-compliance",
  "concept": "shared-responsibility-model",
  "type": "SINGLE_CHOICE",
  "difficulty": "EASY",
  "style": "SCENARIO",
  "question": "A company runs an application on Amazon EC2. Who is responsible for patching the guest operating system?",
  "options": [
    {
      "key": "A",
      "text": "AWS",
      "correct": false
    },
    {
      "key": "B",
      "text": "The customer",
      "correct": true
    },
    {
      "key": "C",
      "text": "AWS Support",
      "correct": false
    },
    {
      "key": "D",
      "text": "The hardware manufacturer",
      "correct": false
    }
  ],
  "tags": [
    "ec2",
    "shared-responsibility",
    "security"
  ]
}
```

---

# 24. Example Lesson Seed

```json
{
  "concept": "shared-responsibility-model",
  "title": "Shared Responsibility Model",
  "summary": "AWS mengelola security OF the cloud, sedangkan customer mengelola security IN the cloud.",
  "keyPoints": [
    "AWS mengelola physical facilities dan underlying infrastructure.",
    "Pada EC2, customer mengelola guest operating system.",
    "Besarnya customer responsibility berbeda tergantung jenis AWS service."
  ],
  "keyNote": "Semakin managed servicenya, semakin banyak responsibility yang ditangani AWS."
}
```

---

# 25. Seed Requirements

Seeder must be idempotent.

Repeated execution:

```bash
npx prisma db seed
```

must not create duplicate certifications, concepts, lessons, questions, or options.

Use stable keys with upsert.

---

# 26. Seed Validation

Before inserting content, validate:

```text
✓ certification exists
✓ topic exists
✓ concept exists
✓ question code is unique
✓ question text is not empty
✓ at least 2 options exist
✓ SINGLE_CHOICE has exactly 1 correct option
✓ MULTIPLE_CHOICE has at least 2 correct options
✓ referenced concept exists
✓ difficulty is valid
✓ question style is valid
```

Seeder must fail with a clear error if validation fails.

Example:

```text
ERROR: CCP-IAM-017

SINGLE_CHOICE requires exactly 1 correct answer.
Found: 2
```

---

# 27. Suggested Data Model

## Certification

```text
id
code
name
active
```

---

## Topic

```text
id
certificationId
slug
name
order
weight
```

---

## Concept

```text
id
topicId
slug
name
generalExplanation
keyNote
referenceUrl
order
active
```

---

## Lesson

```text
id
conceptId
title
summary
keyPoints
order
```

---

## Question

```text
id
code
conceptId
type
difficulty
style
question
active
createdAt
updatedAt
```

---

## QuestionOption

```text
id
questionId
key
text
isCorrect
```

---

## QuestionTag

Optional.

```text
id
questionId
tag
```

---

## Attempt

```text
id
questionId
selectedOptions
isCorrect
confidence
answeredAt
```

The selected answer should be stored as a snapshot so question edits do not invalidate attempt history.

---

## ConceptProgress

```text
id
conceptId

totalAttempts
correctAttempts
wrongAttempts

accuracy

lowConfidenceCount
mediumConfidenceCount
highConfidenceCount

reviewStage
lastReviewedAt
nextReviewAt

masteredAt
```

---

## PracticeSession

```text
id
certificationId
startedAt
endedAt
questionCount
correctCount
```

---

## MockExam

```text
id
certificationId
startedAt
endedAt
questionCount
correctCount
status
```

---

## MockExamQuestion

```text
id
mockExamId
questionId
selectedOptions
isCorrect
```

---

# 28. Question Versioning Consideration

Changing wording should not create a new question identity when the tested scenario remains materially the same.

However, create a new question code if:

- the tested concept changes,
- the answer changes materially,
- the scenario becomes substantially different.

Future enhancement may add:

```text
questionVersion
```

but it is not required for V1.

---

# 29. Retro UI Direction

Visual direction:

```text
Boot.dev learning structure
+
90s RPG menus
+
pixel game HUD
+
developer terminal aesthetic
+
restrained Game Boy-style hierarchy
```

The goal is not to create a children's game.

The application should feel:

```text
retro
technical
focused
developer-oriented
game-like
```

---

# 30. Typography

Use at most two main font families.

### Display / Game Font

Use for:

```text
AWS QUEST
STAGE 02
CORRECT
REVIEW DUE
MOCK EXAM
buttons
badges
```

A pixel-style font is acceptable.

### Content Font

Use a readable monospace or sans-serif font for:

```text
lessons
AWS scenarios
answer options
explanations
long SAA questions
```

Never use a difficult-to-read pixel font for long question text.

---

# 31. Color Direction

Recommended general palette:

```text
Background:
near-black / dark navy

Panels:
dark blue-gray

Primary Accent:
AWS-inspired amber/orange

Secondary:
muted blue

Success:
soft green

Danger:
muted red

Text:
warm off-white
```

Avoid excessive neon rainbow styling.

---

# 32. Game Terminology

Game terminology may be used as secondary flavor.

Examples:

```text
Certification → Campaign
Domain        → Area
Concept       → Stage
Review        → Rematch
Mastered      → Cleared
Mock Exam     → Boss Exam
```

However, standard learning terminology should remain understandable.

For example:

```text
BOSS EXAM
Mock Certification Exam
```

rather than only displaying:

```text
BOSS
```

---

# 33. Learner Home

Example:

```text
AWS QUEST

CURRENT CAMPAIGN
Cloud Practitioner

Mastery
█████████████░░░░ 68%

42 / 76 concepts cleared

[ CONTINUE LEARNING ]

[ PRACTICE ]
[ MOCK EXAM ]

REVIEW DUE
7 concepts
```

Avoid standard SaaS KPI cards unless necessary.

---

# 34. Progress Map

Progress should feel like a game campaign.

Example:

```text
[01] CLOUD CONCEPTS
★★★★☆

      ↓

[02] SECURITY & COMPLIANCE
★★★☆☆
4 REVIEW DUE

      ↓

[03] CLOUD TECHNOLOGY & SERVICES
★★☆☆☆

      ↓

[04] BILLING & SUPPORT
★★★★☆

      ↓

BOSS EXAM
```

The map represents progress but should never block access to Mock Exam.

---

# 35. Result States

## Correct

Example:

```text
★ CLEAR! ★

CORRECT

CONFIDENCE: HIGH

[ CONTINUE ]
```

---

## Incorrect

Example:

```text
NOT CLEARED

YOUR ANSWER
Amazon EBS

CORRECT
Amazon S3

CONCEPT REVIEW
Object storage = Amazon S3.

[ CONTINUE ]
```

Do not immediately repeat the exact question.

---

# 36. Gamification

Keep gamification minimal.

Recommended:

```text
Study streak
Questions answered
Concepts mastered
Stage cleared
Review due
Certification readiness
```

Avoid:

```text
coins
gems
loot boxes
energy
hearts
fake economy
daily reward spam
```

---

# 37. Proposed Routes

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

No `/admin` in V1.

---

# 38. Server Responsibilities

Server-side logic should handle:

- fetching next question,
- recording attempts,
- validating answers,
- calculating concept progress,
- updating review stage,
- selecting review-due concepts,
- creating mock exams,
- generating progress summaries.

Do not trust correctness values submitted by the browser.

The server determines whether an answer is correct.

---

# 39. Client Responsibilities

Client handles:

- question interaction,
- confidence selection,
- retro UI state,
- feedback transitions,
- session checkpoint presentation,
- responsive layout.

Correct answers must not be exposed unnecessarily before submission.

---

# 40. Recommended Practice Flow

```text
Start Practice
     ↓
Choose highest-value concept
     ↓
Choose unused question
     ↓
Show question
     ↓
Answer + confidence
     ↓
Server validates
     ↓
Update Attempt
     ↓
Update ConceptProgress
     ↓
Show feedback
     ↓
Schedule future review
     ↓
Next Question
```

---

# 41. Recommended Learn Flow

```text
Choose concept
     ↓
Read short lesson
     ↓
Immediate question
     ↓
Submit
     ↓
Feedback
     ↓
Optional additional question
     ↓
Mark concept as introduced
     ↓
Schedule future practice
```

---

# 42. Recommended Mock Flow

```text
Start Mock
     ↓
Generate weighted question set
     ↓
Start timer
     ↓
Answer questions
     ↓
No feedback during exam
     ↓
Submit / timer ends
     ↓
Score
     ↓
Domain analysis
     ↓
Weak concept recommendations
```

---

# 43. Out of Scope for V1

Do not build initially:

- AI tutor,
- AI-generated runtime questions,
- chat assistant,
- admin dashboard,
- multiplayer,
- leaderboard,
- cloud labs,
- AWS account integration,
- code execution sandbox,
- video course system,
- payment system,
- social features,
- Redis,
- queues,
- microservices.

---

# 44. Future Enhancements

Possible future features:

- admin/content editor,
- FSRS-style scheduler,
- hands-on AWS labs,
- architecture diagram challenges,
- code-based questions,
- PostgreSQL migration,
- multi-user authentication,
- cloud sync,
- certification readiness scoring,
- question analytics,
- content versioning,
- user-created custom certifications.

---

# 45. MVP Definition

A usable V1 should include:

```text
✓ Next.js full-stack application
✓ Prisma + SQLite
✓ CLF-C02 content
✓ SAA-C03 content
✓ seeded question bank
✓ seeded short lessons
✓ Learn Mode
✓ Practice Mode
✓ Confidence tracking
✓ Adaptive question selection
✓ Concept progress
✓ Spaced review
✓ Mock Exam
✓ Progress page
✓ Retro game visual system
✓ Responsive desktop/mobile layout
```

---

# 46. Recommended Development Order

## Phase 1 — Foundation

```text
Next.js setup
Prisma
SQLite
Core schema
Seeder
Validation
```

## Phase 2 — Content

```text
Certification taxonomy
Topics
Concepts
Lessons
Question bank
AWS references
```

## Phase 3 — Learn Mode

```text
Split layout
Lesson rendering
Immediate question
Feedback
```

## Phase 4 — Practice Engine

```text
Attempt tracking
Confidence
Adaptive selection
Review scheduling
Mastery
```

## Phase 5 — Mock Exam

```text
Exam generation
Timer
Submission
Results
Domain analysis
```

## Phase 6 — Retro UI Polish

```text
HUD
Stage map
Pixel display font
Transitions
Result states
Responsive refinement
```

---

# 47. Final Recommended Stack

```text
Next.js
TypeScript
React
Tailwind CSS
shadcn/ui selectively
Prisma
SQLite
Zod
JSON seed files
```

No AI runtime.

No separate backend.

No admin dashboard initially.

No unnecessary infrastructure.

---

# 48. Final Product Direction

The application should feel like:

```text
A retro developer RPG
where AWS concepts are stages,
practice is the battle system,
review is a rematch,
and the certification mock exam is the boss fight.
```

But underneath the retro visual layer, the learning engine remains serious:

```text
short learning
+
retrieval practice
+
confidence tracking
+
adaptive selection
+
interleaving
+
spaced repetition
+
concept mastery
+
mock exams
```

The result should be a focused personal AWS certification trainer rather than a generic quiz app or full LMS.
