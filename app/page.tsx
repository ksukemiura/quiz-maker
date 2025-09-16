import Link from "next/link";
import { redirect } from "next/navigation";

import MathText from "@/components/MathText";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/database.types";
import { createClient } from "@/lib/supabase/server";

type Quiz = Pick<
  Tables<"quizzes">,
  "id" |
  "title" |
  "created_at"
>;

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data, error } = await supabase
    .from("quizzes")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const quizzes = (data ?? []) as Quiz[];

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quizzes</h1>
      </div>
      <div className="grid gap-4 pt-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="transition-colors">
            <CardHeader>
              <CardTitle>
                <Link className="hover:underline" href={`/quizzes/${quiz.id}`}>
                  <MathText text={quiz.title} />
                </Link>
              </CardTitle>
              <CardDescription>
                Created on {new Date(quiz.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-end gap-2">
              <Button asChild variant="outline">
                <Link href={`/quizzes/${quiz.id}`}>View</Link>
              </Button>
              <Button asChild>
                <Link href={`/quizzes/${quiz.id}/quiz_sessions/new`}>
                  Start Session
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
