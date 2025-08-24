import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizForm } from "@/components/quiz-form/quiz-form";

export default function NewQuizPage() {
  return (
    <div className="container mx-auto max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <QuizForm />
        </CardContent>
      </Card>
    </div>
  );
}
