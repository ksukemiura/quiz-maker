"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuizListItem = {
  id: string;
  title: string;
  created_at: string;
};

export default function Page() {
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const res = await fetch("/api/quizzes");
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        const data = await res.json();
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
          <Link key={quiz.id} href={`/quizzes/${quiz.id}`} className="block">
            <Card className="hover:bg-accent transition-colors">
              <CardHeader>
                <CardTitle>{quiz.title}</CardTitle>
                <CardDescription>Created on {new Date(quiz.created_at).toLocaleDateString()}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
