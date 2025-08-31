"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizForm } from "@/components/quiz-form";
import type { TablesInsert } from "@/database.types";

type Option = Pick<
  TablesInsert<"options">,
  "option" |
  "is_correct"
>;

type Question = Pick<
  TablesInsert<"questions">,
  "question"
> & {
  options: Option[];
};

type Quiz = Pick<
  TablesInsert<"quizzes">,
  "title"
> & {
  questions: Question[];
};

export default function Page() {
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    questions: [
      {
        question: "",
        options: [
          { option: "", is_correct: false },
          { option: "", is_correct: false },
        ],
      }
    ],
  });

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizForm
            quiz={quiz}
            onChange={setQuiz}
          />
        </CardContent>
      </Card>
    </div>
  );
}
