export interface Form {
  formTitle: string;
  formDescription: string;
}

export interface Question {
  id: number;
  questionTitle: string;
  questionDescription: string;
  questionType: "text" | "single-option";
  questionOptions: Option[];
  questionRequired: boolean;
  correctOptionId?: number;
  questionAnswer?: string;
}

export interface Option {
  optionTitle: string;
  optionValue: string;
}

export interface QuestionResponse {
  id: number;
  questionAnswer: string;
}