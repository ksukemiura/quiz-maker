import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@/lib/supabase/server";

type Option = {
  option: string;
  is_correct: boolean;
};

type Question = {
  question: string;
  options: Option[];
};

type Quiz = {
  title: string;
  questions: Question[];
};

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  let body: Quiz;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }
  const { title, questions } = body;

  const quizId = crypto.randomUUID();
  const questionRows = questions.map((question) => ({
    id: crypto.randomUUID(),
    quiz_id: quizId,
    question: question.question,
  }));

  const optionRows = questions.flatMap((question, questionIndex) => {
    const questionId = questionRows[questionIndex].id;
    return question.options.map((option) => ({
      id: crypto.randomUUID(),
      question_id: questionId,
      option: option.option,
      is_correct: option.is_correct,
    }));
  });

  try {
    const { error: quizError } = await supabase
      .from("quizzes")
      .insert(
        {
          id: quizId,
          user_id: user.id,
          title: title,
        },
      );

    if (quizError) {
      return NextResponse.json(
        { error: quizError.message },
        { status: 400 },
      );
    }

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionRows);

    if (questionsError) {
      await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);
      return NextResponse.json(
        { error: questionsError.message },
        { status: 400 },
      );
    }

    const { error: optionsError } = await supabase
      .from("options")
      .insert(optionRows);

    if (optionsError) {
      await supabase
        .from("quizzes")
        .delete()
        .eq("id", quizId);
      return NextResponse.json(
        { error: optionsError.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { id: quizId },
      { status: 201 },
    );
  } catch (error) {
    await supabase
      .from("quizzes")
      .delete()
      .eq("id", quizId);
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 },
    );
  }
}
