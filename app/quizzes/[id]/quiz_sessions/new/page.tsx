import { notFound, redirect } from "next/navigation";

import StartQuizSession from "./client-page";
import type { Tables } from "@/database.types";
import { createClient } from "@/lib/supabase/server";

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

export default async function Page({
  params,
}: {
  params: { id: string };
}) {
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
           option
         )
       )`,
    )
    .eq("id", params.id)
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

  return <StartQuizSession quizId={params.id} quiz={quiz} />;
}
