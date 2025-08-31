"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function QuizifyPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!text.trim()) {
      return;
    }

    try {
      const quiz = await fetch("/api/quizify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({
          title,
          text,
        }),
      });

      if (!quiz.ok) {
        throw new Error(`Failed to parse quiz (status ${quiz.status})`);
      }

      const quizJson = await quiz.json();

      const quizResponse = await fetch("/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        cache: "no-store",
        body: JSON.stringify(quizJson),
      });

      if (!quizResponse.ok) {
        throw new Error(`Failed to create quiz (status ${quizResponse.status})`);
      }

      const { id: quizId } = await quizResponse.json();

      router.push(`/quizzes/${quizId}`);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Quizify</h1>
        <p className="text-sm text-gray-500">
          Enter a title (optional) and paste raw quiz text. We’ll parse it with Gemini and then create the quiz.
        </p>
      </header>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium">
            Quiz title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
            placeholder="simple questions"
            className="w-full rounded-lg border px-3 py-2"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="text" className="block text-sm font-medium">
            Quiz detail
          </label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
            placeholder={`Question 1
What is the capital of Japan?
1. Beijing
2. Tokyo
3. Seoul
4. Bangkok
Correct option index: 2

Question 2
Which of the following are programming languages?
1. Python
2. HTML
3. JavaScript
4. CSS
Correct option indices: 1, 3`}
            rows={14}
            className="w-full rounded-lg border px-3 py-2 font-mono"
            required
          />
        </div>

        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
