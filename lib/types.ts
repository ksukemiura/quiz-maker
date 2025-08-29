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

export type SelectedOption = {
  quiz_session_id: string;
  question_id: string;
  option_id: string;
};

export type QuizSession = {
  quiz_id: string;
  selected_options: SelectedOption[];
};
