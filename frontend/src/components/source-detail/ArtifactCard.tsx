import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Heart, Check, Pencil, X } from "lucide-react";
import { KnowledgeArtifact } from "@/types/source";

interface ArtifactCardProps {
  artifact: KnowledgeArtifact;
  onClick: () => void;
  getTypeColor: (type: string) => string;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
}

export function ArtifactCard({ artifact, onClick, getTypeColor, onAccept, onDecline }: ArtifactCardProps) {
  const isSuggestion = artifact.status === "suggestion";

  const handleAccept = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAccept?.(artifact.id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleDecline = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDecline?.(artifact.id);
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSuggestion
          ? "border-purple-500/50 border-2"
          : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">

              <Badge variant={getTypeColor(artifact.type) as any} className="text-xs">
                {artifact.type}
              </Badge>
              {isSuggestion && (
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
        
        {/* Accept/Edit/Decline workflow for suggestions */}
        {isSuggestion && (
          <div className="flex gap-2 pt-2 border-t border-border">
            <Button
              size="sm"
              variant="default"
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={handleAccept}
            >
              <Check className="h-3 w-3 mr-1" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={handleEdit}
            >
              <Pencil className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={handleDecline}
            >
              <X className="h-3 w-3 mr-1" />
              Decline
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

