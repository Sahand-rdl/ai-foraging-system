import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KnowledgeArtifact, KAType } from "@/types/source";
import { ArtifactCard } from "./ArtifactCard";

interface ArtifactListProps {
  artifacts: KnowledgeArtifact[];
  selectedFilter: KAType | "all";
  onFilterChange: (filter: KAType | "all") => void;
  onArtifactSelect: (id: number) => void;
  getTypeColor: (type: string) => string;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
}

const FILTER_TYPES = ["all", "terminology", "figure", "table", "algorithm"];

export function ArtifactList({ 
  artifacts, 
  selectedFilter, 
  onFilterChange, 
  onArtifactSelect,
  getTypeColor,
  onAccept,
  onDecline
}: ArtifactListProps) {
  return (
    <>
      <div className="border-b border-border h-[64px] flex items-center justify-center">
        {/* <p className="text-sm font-medium text-foreground mb-3">Filter by Type</p> */}
        <div className="flex flex-wrap gap-2">
          {FILTER_TYPES.map((type) => (
            <Button
              key={type}
              variant={selectedFilter === type ? "default" : "outline"}
              size="sm"
              onClick={() => onFilterChange(type as KAType | "all")}
              className="flex-1 "
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {artifacts.map((artifact) => (
            <ArtifactCard 
              key={artifact.id} 
              artifact={artifact}
              onClick={() => onArtifactSelect(artifact.id)}
              getTypeColor={getTypeColor}
              onAccept={onAccept}
              onDecline={onDecline}
            />
          ))}
        </div>
      </ScrollArea>
    </>
  );
}

