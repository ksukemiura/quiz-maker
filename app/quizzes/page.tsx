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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import type { Database } from "@/database.types";

type QuizRow = Database["public"]["Tables"]["quizzes"]["Row"];

export default function Page() {
  const [quizzes, setQuizzes] = useState<QuizRow[]>([]);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const response = await fetch("/api/quizzes");
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }
        const data = await response.json();
        setQuizzes(data.quizzes);
      } catch (error) {
        console.error(error);
      }
    }
    loadQuizzes();
  }, []);

  return (
    <div className="container mx-auto max-w-2xl py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Quizzes</h1>
        <Button>
          <Link href="/quizzes/new">New Quiz</Link>
        </Button>
      </div>
      <div className="grid gap-4 pt-4">
        {quizzes.map((quiz) => (
          <Card key={quiz.id} className="transition-colors">
            <CardHeader>
              <CardTitle>
                <Link className="hover:underline" href={`/quizzes/${quiz.id}`}>
                  {quiz.title}
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
                <Link href={`/quizzes/${quiz.id}/quiz_sessions/new`}>Start Session</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
