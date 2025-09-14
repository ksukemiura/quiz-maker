"use client";

import {
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Tables } from "@/database.types";

type QuizSession =
  Pick<
    Tables<"quiz_sessions">,
    "id" |
    "created_at" |
    "quiz_id"
  > & {
    quiz: Pick<
      Tables<"quizzes">,
      "title"
    >;
  };

export default function Page() {
  const [quizSessions, setQuizSessions] = useState<QuizSession[]>([]);

  useEffect(() => {
    async function loadQuizSessions() {
      try {
        const response = await fetch("/api/quiz_sessions");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.json();
        setQuizSessions(data.quizSessions || []);
      } catch (error) {
        console.error(error);
      }
    }
    loadQuizSessions();
  }, []);

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Quiz Results</h1>
      </div>
      <div className="grid gap-4">
        {quizSessions.map((quizSession) => (
          <Card key={quizSession.id}>
            <CardHeader>
              <CardTitle className="text-xl">
                {quizSession.quiz.title || "Untitled Quiz"}
              </CardTitle>
              <CardDescription>
                Taken on {new Date(quizSession.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-end gap-2">
              <Button asChild>
                <Link href={`/quizzes/${quizSession.quiz_id}/quiz_sessions/${quizSession.id}`}>View Result</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
        {quizSessions.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No quizSessions yet. Start one from the Quizzes page.
          </div>
        )}
      </div>
    </div>
  );
}
