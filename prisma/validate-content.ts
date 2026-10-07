import { ContentValidationError, loadAndValidateAll, summarizeBundle } from "./seeds/content";

loadAndValidateAll()
  .then((bundles) => {
    for (const bundle of bundles) {
      console.log(summarizeBundle(bundle).join("\n"));
      console.log();
    }
    console.log("Content is valid.");
  })
  .catch((error) => {
    console.error(error instanceof ContentValidationError ? error.message : error);
    process.exit(1);
  });
