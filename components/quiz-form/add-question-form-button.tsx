"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddQuestionFormButtonProps {
  onClick: () => void;
}

export function AddQuestionFormButton({ onClick }: AddQuestionFormButtonProps) {
  return (
    <Button type="button" variant="secondary" onClick={onClick} className="w-full">
      <Plus className="mr-2 h-4 w-4" /> Add Question
    </Button>
  );
}
