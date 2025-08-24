"use client";

import { Input } from "@/components/ui/input";
import { OptionForm } from "./option-form";
import { AddOptionFormButton } from "./add-option-form-button";
import type { Question, Option } from "./types";

interface QuestionFormProps {
  value: Question;
  onChange: (value: Question) => void;
}

export function QuestionForm({ value, onChange }: QuestionFormProps) {
  const updateOption = (index: number, option: Option) => {
    const options = [...value.options];
    options[index] = option;
    onChange({ ...value, options });
  };

  const addOption = () => {
    onChange({
      ...value,
      options: [...value.options, { option: "", is_correct: false }],
    });
  };

  const deleteOption = (index: number) => {
    const options = value.options.filter((_, i) => i !== index);
    onChange({ ...value, options });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <Input
        value={value.question}
        onChange={(e) => onChange({ ...value, question: e.target.value })}
        placeholder="Enter your question"
      />
      <div className="flex flex-col gap-2">
        {value.options.map((option, index) => (
          <OptionForm
            key={index}
            value={option}
            onChange={(val) => updateOption(index, val)}
            onDelete={() => deleteOption(index)}
            showDelete={value.options.length > 2}
          />
        ))}
      </div>
      <AddOptionFormButton onClick={addOption} />
    </div>
  );
}
