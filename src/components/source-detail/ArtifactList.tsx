import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Heart } from "lucide-react";
import { KnowledgeArtifact, KAType } from "@/types/source";

interface ArtifactListProps {
  artifacts: KnowledgeArtifact[];
  selectedFilter: KAType | "all";
  onFilterChange: (filter: KAType | "all") => void;
  onArtifactSelect: (id: number) => void;
  getTypeColor: (type: string) => string;
}

const FILTER_TYPES = ["all", "Figure", "Table", "Algo", "Def", "Tech"];

export function ArtifactList({ 
  artifacts, 
  selectedFilter, 
  onFilterChange, 
  onArtifactSelect,
  getTypeColor 
}: ArtifactListProps) {
  return (
    <>
      <div className="p-4 border-b border-border">
        <p className="text-sm font-medium text-foreground mb-3">Filter by Type</p>
        <div className="flex flex-wrap gap-2">
          {FILTER_TYPES.map((type) => (
            <Button
              key={type}
              variant={selectedFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(type as KAType | "all")}
              className="flex-1 min-w-[60px]"
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {artifacts.map((artifact) => (
            <Card 
              key={artifact.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                artifact.status === "suggestion"
                  ? "border-purple-500/50 border-2"
                  : ""
              }`}
              onClick={() => onArtifactSelect(artifact.id)}
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
                      KA: {artifact.title}
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
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <Button className="w-full" size="lg">
          Open Source & Extract KAs
        </Button>
      </div>
    </>
  );
}
