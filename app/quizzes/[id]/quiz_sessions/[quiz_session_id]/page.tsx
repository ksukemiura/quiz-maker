"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/database.types";
import MathText from "@/components/MathText";

type SelectedOption = Pick<
  Tables<"selected_options">,
  "question_id" |
  "option_id"
>;

type Option = Pick<
  Tables<"options">,
  "id" |
  "option" |
  "is_correct"
>;

type Question = Pick<
  Tables<"questions">,
  "id" |
  "question"
> & {
  options: Option[];
};

type Quiz = Pick<
  Tables<"quizzes">,
  "title"
> & {
  questions: Question[];
};

export default function Page({
  params,
}: {
  params: Promise<{ id: string; quiz_session_id: string }>;
}) {
  const { id, quiz_session_id } = use(params);

  const [quiz, setQuiz] = useState<Quiz>({ title: "", questions: [] });
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [quizResponse, quizSessionResponse] = await Promise.all([
          fetch(`/api/quizzes/${id}`),
          fetch(`/api/quiz_sessions/${quiz_session_id}`),
        ]);

        if (!quizResponse.ok) {
          throw new Error(`Quiz load failed: ${quizResponse.status}`);
        }
        if (!quizSessionResponse.ok) {
          throw new Error(`Session load failed: ${quizSessionResponse.status}`);
        }

        const quizData = await quizResponse.json();
        const quizSessionData = await quizSessionResponse.json();

        setQuiz(quizData.quiz);
        setSelectedOptions(quizSessionData.selected_options || []);
      } catch (error) {
        console.error(error);
      }
    }

    load();
  }, [id, quiz_session_id]);

  const selectedOptionsMap = new Map<string, Set<string>>();
  for (const selectedOption of selectedOptions) {
    if (!selectedOptionsMap.has(selectedOption.question_id)) {
      selectedOptionsMap.set(selectedOption.question_id, new Set());
    }
    selectedOptionsMap.get(selectedOption.question_id)!.add(selectedOption.option_id);
  }

  const correctQuestionIds = new Set<string>();
  let score = 0;
  for (const question of quiz.questions) {
    const selectedOptionIds = selectedOptionsMap.get(question.id) ?? new Set<string>();
    const isCorrect = question.options.every(
      (option) => selectedOptionIds.has(option.id) === option.is_correct,
    );
    if (isCorrect) {
      correctQuestionIds.add(question.id);
      score += 1;
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Results</h1>
        <p className="mt-1 text-muted-foreground"><MathText text={quiz.title} /></p>
        <div className="mt-3 text-lg font-medium">
          Score: {score} / {quiz.questions.length}
        </div>
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => {
          const isCorrect = correctQuestionIds.has(question.id);

          return (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-xl flex items-center justify-between">
                  <span className="flex-1">
                    <span className="mr-2">{questionIndex + 1}.</span>
                    <MathText text={question.question} />
                  </span>
                  <Badge variant={isCorrect ? "success" : "destructive"}>
                    {isCorrect ? "+1 point" : "+0 points"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {question.options.map((option) => (
                    <li
                      key={option.id}
                      className="flex items-center justify-between rounded-md border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <span><MathText text={option.option} /></span>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedOptionsMap.get(question.id)?.has(option.id) && (
                          <Badge variant="secondary">Selected</Badge>
                        )}
                        {option.is_correct && (
                          <Badge variant="success">Correct</Badge>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
