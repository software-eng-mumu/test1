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
    if (tag && !selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag]);
    }
    setInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag(input);
            }
          }}
        />
        <Button onClick={() => handleAddTag(input)} variant="secondary">
          Add
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
              className="h-3 w-3 cursor-pointer"
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
                className="cursor-pointer"
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
