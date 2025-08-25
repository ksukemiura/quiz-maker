import {
  NextRequest,
  NextResponse,
} from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("quizzes")
    .select(`
      title,
      questions:questions(
        question,
        options:options!options_question_id_fkey(
          option,
          is_correct
        )
      )
    `)
    .eq("id", params.id)
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
