export type Option = {
  option: string;
  is_correct: boolean;
};

export type Question = {
  question: string;
  options: Option[];
};

export type Quiz = {
  title: string;
  questions: Question[];
}
