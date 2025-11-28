
export enum SyllabusTopic {
  BASIC_IDEAS = "1. Basic Economic Ideas",
  PRICE_SYSTEM = "2. The Price System & Microeconomy",
  GOVT_MICRO = "3. Govt Micro Intervention",
  MACROECONOMY = "4. The Macroeconomy",
  GOVT_MACRO = "5. Govt Macro Intervention",
  INTERNATIONAL = "6. International Economic Issues"
}

export interface Question {
  id: string;
  year: string;
  paper: string; // e.g., "9708/22"
  variant: "Feb/March" | "May/June" | "Oct/Nov";
  questionNumber: string;
  questionText: string;
  topic: SyllabusTopic;
  chapter: string; // e.g., "1.1 Scarcity, choice and opportunity cost"
  markScheme: string; // The raw content from the MS PDF
  maxMarks: number;
}

export interface QuestionState {
  generatorEssay: string;
  graderEssay: string;
  graderFeedback: string;
  realTimeEssay: string;
}

export enum AppMode {
  GENERATOR = "Model Essay Generator",
  GRADER = "Essay Grader",
  COACH = "Real-time Coach"
}
