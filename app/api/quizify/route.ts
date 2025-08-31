import {
  NextRequest,
  NextResponse,
} from "next/server";
import {
  GoogleGenAI,
  Type,
} from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const quizSchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          question: { type: Type.STRING },
          options: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                option: { type: Type.STRING },
                is_correct: { type: Type.BOOLEAN },
              },
              required: ["option", "is_correct"],
              propertyOrdering: ["option", "is_correct"],
            },
          },
        },
        required: ["question", "options"],
        propertyOrdering: ["question", "options"],
      },
    },
  },
  required: ["title", "questions"],
  propertyOrdering: ["title", "questions"],
};

export async function POST(request: NextRequest) {
  try {
    const { text, title } = await request.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing `text`" },
        { status: 400 },
      );
    }

    const userInstruction = [
      "Parse the quiz from the INPUT TEXT and return only JSON that matches the schema.",
      "Rules:",
      "- Keep option order exactly as in the input.",
      "- Indices shown in the input are 1-based.",
      "- Set `is_correct: true` where the option index appears in the 'Correct option index/indices'.",
      "- Do not invent options or questions; copy text verbatim (except trimming whitespace).",
      title ? `- Use this title: ${title}` : `- Set a short descriptive title.`,
      "",
      "INPUT TEXT:",
      text,
    ].join("\n");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInstruction,
      config: {
        responseMimeType: "application/json",
        responseSchema: quizSchema,
      },
    });

    const data = JSON.parse(response.candidates?.[0].content?.parts?.[0].text ?? "");
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to parse quiz" },
      { status: 500 },
    );
  }
}
