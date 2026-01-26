import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart } from "lucide-react";
import { KnowledgeArtifact } from "@/types/source";

interface ArtifactCardProps {
  artifact: KnowledgeArtifact;
  onClick: () => void;
  getTypeColor: (type: string) => string;
}

export function ArtifactCard({ artifact, onClick, getTypeColor }: ArtifactCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        artifact.status === "suggestion"
          ? "border-purple-500/50 border-2"
          : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">ID {artifact.id}</span>
              <Badge variant={getTypeColor(artifact.type) as any} className="text-xs">
                {artifact.type}
              </Badge>
              {artifact.status === "suggestion" && (
                <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Suggestion
                </Badge>
              )}
              {artifact.isBookmarked && (
                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
              )}
            </div>
            <CardTitle className="text-sm font-semibold">
              {artifact.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          {artifact.content}
        </p>
        {artifact.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {artifact.tags.slice(0, 3).map((tag, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {artifact.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{artifact.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
