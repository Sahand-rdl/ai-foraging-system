import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { SourcesTable } from "./SourcesTable";
import { SourcePreviewPane } from "./SourcePreviewPane";
import type { KnowledgeSource } from "@/types/source";
import { deleteKnowledgeSource } from "@/services/api/sources";

interface KnowledgeSourcesViewProps {
  sources: KnowledgeSource[];
  title?: string;
  description?: string;
  showHeader?: boolean;
  getSourceTitle?: (source: KnowledgeSource) => string;
  projectId?: number;
  showRelevance?: boolean; // New prop for conditional rendering
}

export function KnowledgeSourcesView({
  sources,
  title = "Knowledge Sources",
  description = "Manage and analyze your knowledge sources",
  showHeader = true,
  getSourceTitle,
  projectId,
  showRelevance = true, // Default to true
}: KnowledgeSourcesViewProps) {
  const navigate = useNavigate();
  const [selectedSourceId, setSelectedSourceId] = useState<number | null>(null);
  const [currentSearchQuery, setCurrentSearchQuery] = useState(""); // State for the search input

  const selectedSource = sources.find((s) => s.id === selectedSourceId);

  const defaultGetTitle = (source: KnowledgeSource) => {
    return (source.metadata as { title?: string }).title || `Source #${source.id}`;
  };

  const titleFn = getSourceTitle || defaultGetTitle;

  const handleOpenSource = (id: number) => {
    // Close the sidebar before navigating to the full source page
    setSelectedSourceId(null); 
    if (projectId) {
      navigate(`/projects/${projectId}/sources/${id}`);
    } else {
      navigate(`/sources/${id}`);
    }
  };

  const handleDeleteSource = async (id: number) => {
    try {
      await deleteKnowledgeSource(id);
      toast.success("Knowledge source deleted successfully");
      window.location.reload(); 
    } catch (error) {
      console.error("Failed to delete source:", error);
      toast.error("Failed to delete knowledge source");
    }
  };

  const handleGlobalSearch = () => {
    if (currentSearchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(currentSearchQuery)}`);
    }
  };

  return (
    <div className="relative flex h-full flex-col gap-4"> {/* Added relative for positioning */}
      {showHeader && (
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search all sources..." 
                className="pl-8 h-[36px]" 
                value={currentSearchQuery}
                onChange={(e) => setCurrentSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleGlobalSearch();
                  }
                }}
             />
            </div>
            <Button variant="outline" size="icon" className="h-[36px] w-[36px]" onClick={handleGlobalSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Main content area: table always takes full width */}
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full border rounded-md">
          <SourcesTable
            sources={sources}
            selectedSourceId={selectedSourceId}
            onSelectSource={setSelectedSourceId}
            onOpenSource={handleOpenSource}
            onDeleteSource={handleDeleteSource}
            getTitle={titleFn}
            showRelevance={showRelevance} // Pass showRelevance prop down
          />
        </ScrollArea>
      </div>

      {/* Custom Overlaying Sidebar */}
      <div 
        className={`fixed right-0 top-0 bottom-0 w-[500px] sm:max-w-lg bg-background shadow-lg z-50 transform 
          ${selectedSource ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out
          flex flex-col border-l`} // Added border-l for visual separation
      >
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