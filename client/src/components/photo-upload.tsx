import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TagInput } from "./tag-input";
import { Label } from "@/components/ui/label";

export function PhotoUpload() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [event, setEvent] = useState("");
  const [location, setLocation] = useState("");
  const [captionText, setCaptionText] = useState("");

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;

      const formData = new FormData();
      formData.append("photo", selectedFile);
      formData.append("metadata", JSON.stringify({ 
        tags,
        uploadDate: new Date().toISOString(),
        description,
        event,
        location,
        captionText
      }));

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
      setDescription("");
      setEvent("");
      setLocation("");
      setCaptionText("");
      toast({
        title: "成功",
        description: "照片上传成功",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "错误",
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

      <div className="space-y-2">
        <Label>标签</Label>
        <TagInput
          selectedTags={tags}
          onTagsChange={setTags}
          availableTags={[]}
          placeholder="添加标签..."
        />
      </div>

      <div className="space-y-2">
        <Label>事件名称</Label>
        <Input
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          placeholder="例如：春节旅行、生日派对"
        />
      </div>

      <div className="space-y-2">
        <Label>地点</Label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="拍摄地点"
        />
      </div>

      <div className="space-y-2">
        <Label>描述</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="为这张照片添加一些描述..."
        />
      </div>

      <div className="space-y-2">
        <Label>字幕文本</Label>
        <Input
          value={captionText}
          onChange={(e) => setCaptionText(e.target.value)}
          placeholder="视频中显示的文字"
        />
      </div>

      <Button
        onClick={() => uploadMutation.mutate()}
        disabled={!selectedFile || uploadMutation.isPending}
      >
        {uploadMutation.isPending ? "上传中..." : "上传照片"}
      </Button>
    </div>
  );
}