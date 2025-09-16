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
           option
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

  return <StartQuizSession quizId={id} quiz={quiz} />;
}
