"use client";

import {
  use,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import type { Tables } from "@/database.types";

type Option = Pick<
  Tables<"options">,
  "id" |
  "option"
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
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const blankQuiz: Quiz = {
    title: "",
    questions: [],
  };
  const [quiz, setQuiz] = useState<Quiz>(blankQuiz);
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  function updateSelectedOptionIds(
    questionId: string,
    optionId: string,
    isChecked: boolean,
  ) {
    setSelectedOptionIds((currentSelectedOptionIds) => {
      const currentSelectedOptionIdsInQuestion = currentSelectedOptionIds[questionId] ?? [];
      const nextSelectedOptionIdsInQuestion = new Set(currentSelectedOptionIdsInQuestion);

      if (isChecked) {
        nextSelectedOptionIdsInQuestion.add(optionId);
      } else {
        nextSelectedOptionIdsInQuestion.delete(optionId);
      }

      return {
        ...currentSelectedOptionIds,
        [questionId]: Array.from(nextSelectedOptionIdsInQuestion),
      };
    });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const selectedOptions = Object.entries(selectedOptionIds).flatMap(
        ([question_id, option_ids]) =>
          option_ids.map((option_id) =>
            ({ question_id, option_id })
          )
      );

      const response = await fetch("/api/quiz_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: id,
          selected_options: selectedOptions,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      router.push(`/quizzes/${id}/quiz_sessions/${data.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <h1 className="text-3xl font-bold mb-6">{quiz.title}</h1>
      <div className="space-y-6 pb-4">
        {quiz.questions.map((question, questionIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                {questionIndex + 1}. {question.question}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map((option) => {
                  return (
                    <div key={option.id} className="flex items-center gap-3">
                      <Checkbox
                        id={option.id}
                        checked={(selectedOptionIds[question.id] ?? []).includes(option.id)}
                        onCheckedChange={(isChecked) =>
                          updateSelectedOptionIds(question.id, option.id, Boolean(isChecked))
                        }
                      />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        {option.option}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="sticky bottom-0 left-0 right-0 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-3xl flex items-center justify-between gap-4 p-4">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
