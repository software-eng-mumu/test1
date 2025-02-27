import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TagInput } from "./tag-input";

export function PhotoUpload() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;

      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("metadata", JSON.stringify({ tags }));

      const res = await fetch("/api/photos", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to upload photo");
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/photos"] });
      setSelectedFile(null);
      setTags([]);
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex flex-col gap-4 w-full md:w-auto">
      <Input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
      />
      <TagInput
        selectedTags={tags}
        onTagsChange={setTags}
        availableTags={[]}
        placeholder="Add tags..."
      />
      <Button
        onClick={() => uploadMutation.mutate()}
        disabled={!selectedFile || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "Uploading..." : "Upload Photo"}
      </Button>
    </div>
  );
}
