import { useState } from "react";
import { type Photo } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function PhotoGrid({ photos }: { photos: Photo[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img
              src={`/api/photos/${photo.id}`}
              alt={photo.filename}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
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
