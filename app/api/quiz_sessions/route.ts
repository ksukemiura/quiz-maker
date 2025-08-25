import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@/lib/supabase/server";

// Types for the request body
export type SelectedOption = {
  question_id: string;
  option_id: string;
};

export type QuizSession = {
  quiz_id: string;
  selected_options: SelectedOption[];
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

  let body: QuizSession;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON" },
      { status: 400 },
    );
  }

  if (!body.quiz_id || !Array.isArray(body.selected_options)) {
    return NextResponse.json(
      { error: "Invalid payload" },
      { status: 400 },
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("quiz_sessions")
    .insert({
      quiz_id: body.quiz_id,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: sessionError?.message ?? "Failed to create session" },
      { status: 400 },
    );
  }

  const selectedOptions = body.selected_options.map((option) => ({
    quiz_session_id: session.id,
    question_id: option.question_id,
    option_id: option.option_id,
  }));

  if (selectedOptions.length > 0) {
    const { error: selectedError } = await supabase
      .from("selected_options")
      .insert(selectedOptions);

    if (selectedError) {
      return NextResponse.json(
        { error: selectedError.message },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(
    { id: session.id },
    { status: 201 },
  );
}
