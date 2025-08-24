"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuestionForm } from "./question-form";
import { AddQuestionFormButton } from "./add-question-form-button";
import type { Question } from "./types";
import { useRouter } from "next/navigation";

export function QuizForm() {
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      options: [
        { option: "", is_correct: false },
        { option: "", is_correct: false },
      ],
    },
  ]);
  const router = useRouter();

  const updateQuestion = (index: number, question: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = question;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: "",
        options: [
          { option: "", is_correct: false },
          { option: "", is_correct: false },
        ],
      },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, questions }),
    });

    if (response.ok) {
      const data = await response.json();
      router.push(`/quizzes/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter quiz title"
      />
      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <QuestionForm
            key={i}
            value={q}
            onChange={(val) => updateQuestion(i, val)}
          />
        ))}
      </div>
      <AddQuestionFormButton onClick={addQuestion} />
      <Button type="submit" className="self-end">Create Quiz</Button>
    </form>
  );
}
