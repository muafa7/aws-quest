export type Confidence = "LOW" | "MEDIUM" | "HIGH";
export type LearningMode = "LEARN" | "PRACTICE";

export type SafeQuestion = {
  id: number;
  code: string;
  type: string;
  difficulty: string;
  style: string;
  prompt: string;
  concept: {
    id: number;
    slug: string;
    name: string;
    generalExplanation: string;
    keyNote: string | null;
  };
  options: Array<{
    key: string;
    text: string;
  }>;
};
