"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { QuizForm } from "@/components/quiz-form";
import { Quiz } from "@/components/types";

export default function Page() {
  const blankQuiz: Quiz = {
    title: "",
    questions: [
      {
        question: "",
        options: [
          { option: "", is_correct: false },
          { option: "", is_correct: false },
        ],
      },
    ],
  };
  const [quiz, setQuiz] = useState<Quiz>(blankQuiz);

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
