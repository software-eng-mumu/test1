import { useState } from "react";
import { type Photo } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handlePhotoClick = (photo: Photo, isSelecting: boolean) => {
    if (isSelecting) {
      setSelectedPhotos(prev => 
        prev.includes(photo.id) 
          ? prev.filter(id => id !== photo.id)
          : [...prev, photo.id]
      );
    } else {
      setSelectedPhoto(photo);
    }
  };

  const handleGenerateVideo = async () => {
    if (selectedPhotos.length < 2) {
      toast({
        title: "选择错误",
        description: "请至少选择两张图片来生成视频",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/generate-video", { photoIds: selectedPhotos });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'slideshow.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "成功",
        description: "视频已生成并开始下载",
      });
    } catch (error) {
      toast({
        title: "错误",
        description: "视频生成失败",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setSelectedPhotos([]);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {selectedPhotos.length > 0 && (
          <div className="flex justify-between items-center">
            <span>已选择 {selectedPhotos.length} 张图片</span>
            <Button
              onClick={handleGenerateVideo}
              disabled={isGenerating}
            >
              {isGenerating ? "生成中..." : "生成视频"}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handlePhotoClick(photo, selectedPhotos.length > 0)}
            >
              <img
                src={`/api/photos/${photo.id}`}
                alt={photo.filename}
                className="object-cover w-full h-full"
              />
              {selectedPhotos.length > 0 && (
                <div className="absolute top-2 left-2">
                  <Checkbox
                    checked={selectedPhotos.includes(photo.id)}
                    className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        {selectedPhoto && (
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedPhoto.filename}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <img
                src={`/api/photos/${selectedPhoto.id}`}
                alt={selectedPhoto.filename}
                className="rounded-lg max-h-[70vh] object-contain"
              />
              <div className="flex flex-wrap gap-2">
                {selectedPhoto.metadata.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}