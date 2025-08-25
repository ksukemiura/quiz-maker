import { Input } from "@/components/ui/input";
import { OptionForm } from "@/components/option-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Question, Option } from "@/components/types";

interface QuestionFormProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete: () => void;
  showDelete: boolean;
}

export function QuestionForm({
  question,
  onChange,
  onDelete,
  showDelete,
}: QuestionFormProps) {
  function createBlankOption(): Option {
    return {
      option: "",
      is_correct: false,
    };
  }

  function addOption() {
    onChange({
      ...question,
      options: [
        ...question.options,
        createBlankOption(),
      ],
    });
  };

  function updateOption(index: number, option: Option) {
    const options = [...question.options];
    options[index] = option;
    onChange({ ...question, options });
  };

  function deleteOption(index: number) {
    const options = question.options.filter((_, i) => i !== index);
    onChange({ ...question, options });
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-4">
      <p className="text-lg font-semibold">Question</p>
      <Input
        value={question.question}
        onChange={(e) => onChange({ ...question, question: e.target.value })}
        placeholder="Enter your question"
      />
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold">Options</p>
        {question.options.map((option, index) => (
          <OptionForm
            key={index}
            option={option}
            onChange={(option) => updateOption(index, option)}
            onDelete={() => deleteOption(index)}
            showDelete={question.options.length > 2}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={addOption}
        className="self-start"
      >
        <Plus className="mr-2 h-4 w-4" /> Add Option
      </Button>
      {showDelete && (
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="self-start"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Question
        </Button>
      )}
    </div>
  );
}
