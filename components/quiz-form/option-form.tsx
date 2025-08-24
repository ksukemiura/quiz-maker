"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Option } from "./types";

interface OptionFormProps {
  value: Option;
  onChange: (value: Option) => void;
  onDelete: () => void;
  showDelete: boolean;
}

export function OptionForm({
  value,
  onChange,
  onDelete,
  showDelete,
}: OptionFormProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={value.is_correct}
        onCheckedChange={(checked) =>
          onChange({ ...value, is_correct: checked === true })
        }
      />
      <Input
        value={value.option}
        onChange={(e) => onChange({ ...value, option: e.target.value })}
        placeholder="Option"
      />
      {showDelete && (
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
