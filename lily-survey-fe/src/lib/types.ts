export interface QuestionOption {
  id: number;
  optionTitle: string;
  optionValue: string;
}

export interface Question {
  id: number;
  correctOptionId: number | null;
  questionAnswer: string | null;
  questionDescription: string;
  questionOptions: QuestionOption[];
  questionRequired: number;
  questionTitle: string;
  questionType: string;
}

export interface FormData {
  form: {
    id: number;
    formTitle: string;
    formDescription: string;
  };
  questions: Question[];
}

export interface QuestionResponse {
  id: number;
  questionAnswer: string;
}