import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PhotoGrid } from "@/components/photo-grid";
import { PhotoUpload } from "@/components/photo-upload";
import { TagInput } from "@/components/tag-input";
import { useState } from "react";
import { type Photo } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { data: photos, isLoading } = useQuery<Photo[]>({
    queryKey: ["/api/photos"],
  });

  const filteredPhotos = photos?.filter(photo => 
    selectedTags.length === 0 || 
    selectedTags.every(tag => photo.metadata.tags.includes(tag))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Photo Album</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.username}</span>
            <Button variant="outline" onClick={() => logoutMutation.mutate()}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
            <PhotoUpload />
            <TagInput 
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              availableTags={Array.from(new Set(photos?.flatMap(p => p.metadata.tags) || []))}
            />
          </div>
          
          <PhotoGrid photos={filteredPhotos || []} />
        </div>
      </main>
    </div>
  );
}
