import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { TablesInsert } from "@/database.types";

type Option = Pick<
  TablesInsert<"options">,
  "option" |
  "is_correct"
>;

interface OptionFormProps {
  option: Option;
  onChange: (option: Option) => void;
  onDelete: () => void;
  showDelete: boolean;
}

export function OptionForm({
  option,
  onChange,
  onDelete,
  showDelete,
}: OptionFormProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        checked={option.is_correct}
        onCheckedChange={(checked) => onChange({ ...option, is_correct: checked === true })}
      />
      <Input
        value={option.option}
        onChange={(e) => onChange({ ...option, option: e.target.value })}
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
