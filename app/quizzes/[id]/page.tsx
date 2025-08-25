"use client";

import type { Quiz } from "@/lib/types";
import {
  use,
  useEffect,
  useState,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<Quiz>({
    title: "",
    questions: [],
  });

  useEffect(() => {
    async function loadQuiz() {
      try {
        const response = await fetch(`/api/quizzes/${id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.json();
        setQuiz(data.quiz);
      } catch (error) {
        console.error(error);
      }
    }
    loadQuiz();
  }, [id]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">{quiz.title}</h1>
      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => (
          <Card key={questionIndex}>
            <CardHeader>
              <CardTitle className="text-xl">
                {questionIndex + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <li key={optionIndex} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                      {optionIndex + 1}
                    </span>
                    <span>{option.option}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
