import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { type VideoOptions } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface VideoGeneratorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPhotos: number[];
}

export function VideoGeneratorDialog({
  open,
  onOpenChange,
  selectedPhotos,
}: VideoGeneratorDialogProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [options, setOptions] = useState<Partial<VideoOptions>>({
    transition: "fade",
    duration: 3,
    sortBy: "uploadDate",
    captions: true,
  });

  const handleGenerate = async () => {
    if (selectedPhotos.length < 2) {
      toast({
        title: "选择错误",
        description: "请至少选择两张照片来生成视频",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/generate-video", {
        ...options,
        photoIds: selectedPhotos,
      });
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'memory.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "成功",
        description: "视频已生成并开始下载",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "错误",
        description: "视频生成失败",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>生成回忆视频</DialogTitle>
          <DialogDescription>
            自定义视频选项，创建独特的回忆视频
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>标题</Label>
            <Input
              placeholder="视频标题"
              value={options.title || ""}
              onChange={(e) =>
                setOptions((prev) => ({ ...prev, title: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <Label>排序方式</Label>
            <Select
              value={options.sortBy}
              onValueChange={(value: VideoOptions["sortBy"]) =>
                setOptions((prev) => ({ ...prev, sortBy: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uploadDate">按上传时间</SelectItem>
                <SelectItem value="event">按事件</SelectItem>
                <SelectItem value="custom">自定义顺序</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>转场效果</Label>
            <Select
              value={options.transition}
              onValueChange={(value: VideoOptions["transition"]) =>
                setOptions((prev) => ({ ...prev, transition: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fade">淡入淡出</SelectItem>
                <SelectItem value="slide">滑动</SelectItem>
                <SelectItem value="zoom">缩放</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>照片持续时间（秒）</Label>
            <Slider
              value={[options.duration || 3]}
              onValueChange={([value]) =>
                setOptions((prev) => ({ ...prev, duration: value }))
              }
              min={1}
              max={10}
              step={0.5}
            />
            <span className="text-sm text-muted-foreground">
              {options.duration} 秒
            </span>
          </div>

          <div className="flex items-center justify-between">
            <Label>显示字幕</Label>
            <Switch
              checked={options.captions}
              onCheckedChange={(checked) =>
                setOptions((prev) => ({ ...prev, captions: checked }))
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? "生成中..." : "生成视频"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
