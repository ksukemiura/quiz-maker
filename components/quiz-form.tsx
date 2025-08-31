"use client";

import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuestionForm } from "@/components/question-form";
import { Plus } from "lucide-react";
import type { TablesInsert } from "@/database.types";

type Option = Pick<
  TablesInsert<"options">,
  "option" |
  "is_correct"
>;

type Question = Pick<
  TablesInsert<"questions">,
  "question"
> & {
  options: Option[];
};

type Quiz = Pick<
  TablesInsert<"quizzes">,
  "title"
> & {
  questions: Question[];
};

interface QuizFormProps {
  quiz: Quiz;
  onChange: (quiz: Quiz) => void;
}

export function QuizForm({
  quiz,
  onChange,
}: QuizFormProps) {
  const router = useRouter();

  function createBlankQuestion(): Question {
    return {
      question: "",
      options: [
        { option: "", is_correct: false },
        { option: "", is_correct: false },
      ],
    };
  }

  function addQuestion() {
    onChange({
      ...quiz,
      questions: [
        ...quiz.questions,
        createBlankQuestion(),
      ],
    });
  };

  function updateQuestion(index: number, question: Question) {
    const questions = [...quiz.questions];
    questions[index] = question;
    onChange({ ...quiz, questions });
  };

  function deleteQuestion(index: number) {
    const questions = quiz.questions.filter((_, i) => i !== index);
    onChange({ ...quiz, questions });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const response = await fetch("/api/quizzes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(quiz),
    });

    if (response.ok) {
      const data = await response.json();
      router.push(`/quizzes/${data.id}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <p className="text-lg font-semibold">Quiz Title</p>
      <Input
        value={quiz.title}
        onChange={(e) => onChange({ ...quiz, title: e.target.value })}
        placeholder="Enter quiz title"
      />
      <div className="flex flex-col gap-4">
        <p className="text-lg font-semibold">Questions</p>
        {quiz.questions.map((question, index) => (
          <QuestionForm
            key={index}
            question={question}
            onChange={(question) => updateQuestion(index, question)}
            onDelete={() => deleteQuestion(index)}
            showDelete={quiz.questions.length > 1}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={addQuestion}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Question
      </Button>
      <Button
        type="submit"
        className="self-end"
      >
        Create Quiz
      </Button>
    </form>
  );
}
