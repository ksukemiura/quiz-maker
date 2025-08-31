import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert } from "@/database.types";

type QuizSession = TablesInsert<"quiz_sessions"> & {
  selected_options: TablesInsert<"selected_options">[];
}

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { data, error } = await supabase
    .from("quiz_sessions")
    .select(`
      id,
      created_at,
      quiz_id,
      quiz:quizzes(
        id,
        title
      )
    `)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { quizSessions: data ?? [] },
    { status: 200 },
  );
}

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

  const { data: quizSession, error: quizSessionError } = await supabase
    .from("quiz_sessions")
    .insert({
      quiz_id: body.quiz_id,
      user_id: user.id,
    })
    .select("id")
    .single();

  if (quizSessionError) {
    return NextResponse.json(
      { error: quizSessionError.message },
      { status: 400 },
    );
  }

  const selectedOptions = body.selected_options.map((selected_option) => ({
    quiz_session_id: quizSession.id,
    question_id: selected_option.question_id,
    option_id: selected_option.option_id,
  }));

  if (selectedOptions.length > 0) {
    const { error: selectedOptionsError } = await supabase
      .from("selected_options")
      .insert(selectedOptions);

    if (selectedOptionsError) {
      return NextResponse.json(
        { error: selectedOptionsError.message },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(
    { id: quizSession.id },
    { status: 201 },
  );
}
