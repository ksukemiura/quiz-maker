"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddOptionFormButtonProps {
  onClick: () => void;
}

export function AddOptionFormButton({ onClick }: AddOptionFormButtonProps) {
  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={onClick}
      className="self-start"
    >
      <Plus className="mr-2 h-4 w-4" /> Add Option
    </Button>
  );
}
