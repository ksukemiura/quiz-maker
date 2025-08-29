import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const supabase = await createClient();
  const { id } = await params;

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      title,
      questions:questions(
        id,
        question,
        options:options!options_question_id_fkey(
          id,
          option,
          is_correct
        )
      )
    `)
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { quiz: data },
    { status: 200 },
  );
}
