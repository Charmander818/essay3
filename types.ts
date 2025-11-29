
export enum SyllabusTopic {
  BASIC_IDEAS = "1. Basic Economic Ideas",
  PRICE_SYSTEM = "2. The Price System & Microeconomy",
  GOVT_MICRO = "3. Govt Micro Intervention",
  MACROECONOMY = "4. The Macroeconomy",
  GOVT_MACRO = "5. Govt Macro Intervention",
  INTERNATIONAL = "6. International Economic Issues",
  
  // A Level Topics
  PRICE_SYSTEM_AL = "7. The Price System & Microeconomy (AL)",
  GOVT_MICRO_AL = "8. Govt Micro Intervention (AL)",
  MACROECONOMY_AL = "9. The Macroeconomy (AL)",
  GOVT_MACRO_AL = "10. Govt Macro Intervention (AL)",
  INTERNATIONAL_AL = "11. International Economic Issues (AL)"
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

export interface ClozeBlank {
  id: number;
  original: string;
  hint: string;
}

export interface ClozeFeedback {
  score: number;
  comment: string;
}

export interface QuestionState {
  generatorEssay: string;
  graderEssay: string;
  graderFeedback: string;
  realTimeEssay: string;
  
  // Logic Trainer / Cloze State
  clozeData?: {
    textWithBlanks: string; // The text containing [BLANK_1] etc
    blanks: ClozeBlank[];
  };
  clozeUserAnswers?: Record<number, string>;
  clozeFeedback?: Record<number, ClozeFeedback>;
}

export enum AppMode {
  GENERATOR = "Model Essay Generator",
  IMPROVER = "Logic Trainer",
  GRADER = "Essay Grader",
  COACH = "Real-time Coach"
}
