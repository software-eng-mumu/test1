import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TagInputProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableTags: string[];
  placeholder?: string;
}

export function TagInput({
  selectedTags,
  onTagsChange,
  availableTags,
  placeholder = "Filter by tags...",
}: TagInputProps) {
  const [input, setInput] = useState("");

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      const newTags = [...selectedTags, trimmedTag];
      onTagsChange(newTags);
      setInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter((tag) => tag !== tagToRemove);
    onTagsChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && input.trim()) {
      e.preventDefault();
      handleAddTag(input);
    } else if (e.key === "Backspace" && !input && selectedTags.length > 0) {
      // 当输入框为空且按下退格键时，删除最后一个标签
      const newTags = selectedTags.slice(0, -1);
      onTagsChange(newTags);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
        <Button 
          onClick={() => handleAddTag(input)}
          variant="secondary"
          disabled={!input.trim()}
        >
          添加
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1"
          >
            {tag}
            <X
              className="h-3 w-3 cursor-pointer hover:text-destructive"
              onClick={() => handleRemoveTag(tag)}
            />
          </Badge>
        ))}
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {availableTags
            .filter((tag) => !selectedTags.includes(tag))
            .map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="cursor-pointer hover:bg-secondary"
                onClick={() => handleAddTag(tag)}
              >
                {tag}
              </Badge>
            ))}
        </div>
      )}
    </div>
  );
}