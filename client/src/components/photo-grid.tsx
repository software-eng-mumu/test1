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
import { Eye } from "lucide-react";
import { VideoGeneratorDialog } from "./video-generator-dialog";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([]);
  const [showVideoDialog, setShowVideoDialog] = useState(false);

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhotos(prev => 
      prev.includes(photo.id) 
        ? prev.filter(id => id !== photo.id)
        : [...prev, photo.id]
    );
  };

  const handleViewPhoto = (photo: Photo, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPhoto(photo);
  };

  return (
    <>
      <div className="flex flex-col gap-4">
        {selectedPhotos.length > 0 && (
          <div className="flex justify-between items-center">
            <span>已选择 {selectedPhotos.length} 张照片</span>
            <Button onClick={() => setShowVideoDialog(true)}>
              制作视频
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="group aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => handlePhotoClick(photo)}
            >
              <img
                src={`/api/photos/${photo.id}`}
                alt={photo.filename}
                className="object-cover w-full h-full"
              />
              <div className="absolute top-2 left-2">
                <Checkbox
                  checked={selectedPhotos.includes(photo.id)}
                  className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
              </div>
              <button
                className="absolute top-2 right-2 p-1 rounded-full bg-black/50 hover:bg-black/70 text-white"
                onClick={(e) => handleViewPhoto(photo, e)}
              >
                <Eye className="h-4 w-4" />
              </button>
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
              <div className="space-y-4">
                {selectedPhoto.metadata.event && (
                  <p>事件：{selectedPhoto.metadata.event}</p>
                )}
                {selectedPhoto.metadata.location && (
                  <p>地点：{selectedPhoto.metadata.location}</p>
                )}
                {selectedPhoto.metadata.description && (
                  <p>描述：{selectedPhoto.metadata.description}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  {selectedPhoto.metadata.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <VideoGeneratorDialog
        open={showVideoDialog}
        onOpenChange={setShowVideoDialog}
        selectedPhotos={selectedPhotos}
      />
    </>
  );
}