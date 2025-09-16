"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import MathText from "@/components/MathText";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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

type Quiz = Pick<Tables<"quizzes">, "title"> & {
  questions: Question[];
};

interface StartQuizSessionProps {
  quizId: string;
  quiz: Quiz;
}

export default function StartQuizSession({ quizId, quiz }: StartQuizSessionProps) {
  const router = useRouter();
  const [selectedOptionIds, setSelectedOptionIds] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateSelectedOptionIds(
    questionId: string,
    optionId: string,
    isChecked: boolean,
  ) {
    setSelectedOptionIds((current) => {
      const currentForQuestion = current[questionId] ?? [];
      const nextForQuestion = new Set(currentForQuestion);

      if (isChecked) {
        nextForQuestion.add(optionId);
      } else {
        nextForQuestion.delete(optionId);
      }

      return {
        ...current,
        [questionId]: Array.from(nextForQuestion),
      };
    });
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const selectedOptions = Object.entries(selectedOptionIds).flatMap(
        ([question_id, option_ids]) =>
          option_ids.map((option_id) => ({ question_id, option_id })),
      );

      const response = await fetch("/api/quiz_sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: quizId,
          selected_options: selectedOptions,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      router.push(`/quizzes/${quizId}/quiz_sessions/${data.id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto max-w-3xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        <MathText text={quiz.title} />
      </h1>
      <div className="space-y-6 pb-4">
        {quiz.questions.map((question, questionIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                <span className="mr-2">{questionIndex + 1}.</span>
                <MathText text={question.question} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map((option) => {
                  const checked = (selectedOptionIds[question.id] ?? []).includes(option.id);

                  return (
                    <div key={option.id} className="flex items-center gap-3">
                      <Checkbox
                        id={option.id}
                        checked={checked}
                        onCheckedChange={(value) =>
                          updateSelectedOptionIds(question.id, option.id, Boolean(value))
                        }
                      />
                      <Label htmlFor={option.id} className="cursor-pointer">
                        <MathText text={option.option} />
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
        <div className="container mx-auto flex max-w-3xl items-center justify-between gap-4 p-4">
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
