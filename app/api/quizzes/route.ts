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

  const { data: quizId, error } = await supabase.rpc("create_quiz", {
    quiz_json: body,
  });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { id: quizId },
    { status: 201 },
  );
}
