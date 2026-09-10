// Типы контента лекции

export interface TermDef {
  term: string;
  def: string;
  example?: string;
}

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number; // индекс правильного варианта
  explain: string;
}

export interface QuizData {
  id: string;
  title: string;
  emoji: string;
  questions: QuizQuestion[];
}

export type Block =
  | { kind: "text"; text: string } // поддерживает [[term:...]] и **жирный**
  | { kind: "terms"; terms: string[] } // id из glossary
  | { kind: "law"; title: string; url: string; note?: string }
  | { kind: "demo"; demo: DemoId; title?: string; hint?: string }
  | { kind: "quiz"; quiz: QuizData }
  | { kind: "joke"; emoji: string; text: string; punch?: string }
  | { kind: "quote"; text: string; source?: string }; // «как в конспекте»

export interface Module {
  id: string;
  title: string;
  icon: string;
  theme: 1 | 2;
  xp: number;
  blocks: Block[];
}

export type DemoId =
  | "trade-flow"
  | "tnk"
  | "classify-forms"
  | "classify-subjects"
  | "duty-calc"
  | "case-measures"
  | "scales"
  | "position-sim"
  | "case-risks";
