import { notFound, redirect } from "next/navigation";

import MathText from "@/components/MathText";
import StartQuizButton from "@/components/start-quiz-button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/database.types";
import { createClient } from "@/lib/supabase/server";

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

type Quiz = Pick<Tables<"quizzes">, "title"> & {
  questions: Question[];
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select(
      `title,
       questions:questions(
         id,
         question,
         options:options!options_question_id_fkey(
           id,
           option,
           is_correct
         )
       )`,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error?.code === "PGRST116") {
    notFound();
  }

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    notFound();
  }

  const quiz = data as Quiz;

  return (
    <div className="mx-auto max-w-3xl p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          <MathText text={quiz.title} />
        </h1>
        <StartQuizButton href={`/quizzes/${id}/quiz_sessions/new`}>
          Start Quiz
        </StartQuizButton>
      </div>
      <div className="space-y-6">
        {quiz.questions.map((question, questionIndex) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                <span className="mr-2">{questionIndex + 1}.</span>
                <MathText text={question.question} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {question.options.map((option, optionIndex) => (
                  <li key={option.id} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                      {optionIndex + 1}
                    </span>
                    <span>
                      <MathText text={option.option} />
                    </span>
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
