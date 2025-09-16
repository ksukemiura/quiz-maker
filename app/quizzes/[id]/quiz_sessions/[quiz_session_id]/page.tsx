import { notFound, redirect } from "next/navigation";

import QuizSessionResult from "./client-page";
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

type SelectedOption = Pick<
  Tables<"selected_options">,
  "question_id" |
  "option_id"
>;

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; quiz_session_id: string }>;
}) {
  const { id, quiz_session_id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [quizResult, sessionResult] = await Promise.all([
    supabase
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
    .single(),
  supabase
    .from("quiz_sessions")
      .select(
        `id,
         quiz_id,
         selected_options(
           question_id,
           option_id
         )`,
      )
      .eq("id", quiz_session_id)
      .eq("quiz_id", id)
      .eq("user_id", user.id)
      .single(),
  ]);

  if (quizResult.error?.code === "PGRST116" || sessionResult.error?.code === "PGRST116") {
    notFound();
  }

  if (quizResult.error) {
    throw new Error(quizResult.error.message);
  }

  if (sessionResult.error) {
    throw new Error(sessionResult.error.message);
  }

  if (!quizResult.data || !sessionResult.data) {
    notFound();
  }

  const quiz = quizResult.data as Quiz;
  const selectedOptions =
    (sessionResult.data.selected_options ?? []) as SelectedOption[];

  return <QuizSessionResult quiz={quiz} selectedOptions={selectedOptions} />;
}
