import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SourcesTable } from "./SourcesTable";
import { SourcePreviewPane } from "./SourcePreviewPane";
import type { KnowledgeSource } from "@/types/source";

interface KnowledgeSourcesViewProps {
  sources: KnowledgeSource[];
  title?: string;
  description?: string;
  showHeader?: boolean;
  getSourceTitle?: (source: KnowledgeSource) => string;
}

export function KnowledgeSourcesView({
  sources,
  title = "Knowledge Sources",
  description = "Manage and analyze your knowledge sources",
  showHeader = true,
  getSourceTitle,
}: KnowledgeSourcesViewProps) {
  const navigate = useNavigate();
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);

  const selectedSource = sources.find((s) => s.id === selectedSourceId);

  // Default title getter - tries metadata.title, falls back to ID
  const defaultGetTitle = (source: KnowledgeSource) => {
    return (source.metadata as { title?: string }).title || `Source #${source.id}`;
  };

  const titleFn = getSourceTitle || defaultGetTitle;

  const handleOpenSource = (id: number) => {
    navigate(`/sources/${id}`);
  };

  return (
    <div className="flex h-full flex-col gap-4">
      {showHeader && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search sources..." className="pl-8" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Left Column: Table */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            selectedSource ? "w-2/3" : "w-full"
          }`}
        >
          <ScrollArea className="flex-1 border rounded-md">
            <SourcesTable
              sources={sources}
              selectedSourceId={selectedSourceId}
              onSelectSource={setSelectedSourceId}
              onOpenSource={handleOpenSource}
              getTitle={titleFn}
            />
          </ScrollArea>
        </div>

        {/* Right Column: Preview Pane */}
        {selectedSource && (
          <SourcePreviewPane
            source={selectedSource}
            title={titleFn(selectedSource)}
            onClose={() => setSelectedSourceId(null)}
            onOpenSource={handleOpenSource}
          />
        )}
      </div>
    </div>
  );
}
