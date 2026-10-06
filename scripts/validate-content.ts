import {
  loadAllSeedBundles,
  validateSeedBundles,
} from "../prisma/seeds/bundle";

const bundles =
  await loadAllSeedBundles();

validateSeedBundles(bundles);

console.log("");

console.log(
  "AWS Quest Content Validation",
);

console.log(
  "============================",
);

console.log("");

for (const bundle of bundles) {
  console.log(
    `✓ ${bundle.certification.code}`,
  );

  console.log(
    `  Topics:    ${bundle.topics.length}`,
  );

  console.log(
    `  Concepts:  ${bundle.concepts.length}`,
  );

  console.log(
    `  Lessons:   ${bundle.lessons.length}`,
  );

  console.log(
    `  Questions: ${bundle.questions.length}`,
  );

  console.log("");
}

const totalQuestions =
  bundles.reduce(
    (total, bundle) =>
      total +
      bundle.questions.length,

    0,
  );

console.log(
  `✓ Validation passed`,
);

console.log(
  `✓ Total questions: ${totalQuestions}`,
);