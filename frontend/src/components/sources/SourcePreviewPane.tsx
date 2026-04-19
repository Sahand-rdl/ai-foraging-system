import { useEffect, useState } from "react";
import { Star, ExternalLink, ChevronRight, Heart, FileText, Table2, Image, Code, BookOpen, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { fetchKnowledgeArtifactsBySourceId } from "@/services/api";
import type { KnowledgeSource, KnowledgeArtifact, KAType } from "@/types/source";

interface SourcePreviewPaneProps {
  source: KnowledgeSource;
  title?: string;
  onClose?: () => void;
  onOpenSource?: (id: number) => void;
}

function getTypeIcon(type: KAType) {
    switch (type) {
      case "figure": return <Image className="h-3 w-3" />;
      case "table": return <Table2 className="h-3 w-3" />;
      case "algorithm": return <Code className="h-3 w-3" />;
      case "terminology": return <BookOpen className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
}

function formatAuthors(authors: string | string[] | undefined): string {
  if (!authors) return "";
  if (Array.isArray(authors)) {
    return authors.join(", ");
  }
  return authors;
}

export function SourcePreviewPane({ source, title, onClose, onOpenSource }: SourcePreviewPaneProps) {
  const displayTitle = title || `Source #${source.id}`;
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [loadingArtifacts, setLoadingArtifacts] = useState(false);

  useEffect(() => {
    async function loadArtifacts() {
        setLoadingArtifacts(true);
        try {
            const data = await fetchKnowledgeArtifactsBySourceId(source.id);
            setArtifacts(data);
        } catch (error) {
            console.error("Failed to load artifacts for source preview", error);
            setArtifacts([]);
        } finally {
            setLoadingArtifacts(false);
        }
    }
    loadArtifacts();
  }, [source.id]);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold leading-none truncate pr-10" title={displayTitle}>
                {displayTitle}
            </h3>
            <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
                <X className="h-4 w-4" />
            </Button>
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Metadata</h4>
            <div className="grid grid-cols-[100px_1fr] gap-x-4 gap-y-2 text-sm">
              {source.metadata.authors && (
                <>
                  <span className="text-muted-foreground">Authors</span>
                  <span className="font-medium">{formatAuthors(source.metadata.authors)}</span>
                </>
              )}
              {source.metadata.date && (
                <>
                  <span className="text-muted-foreground">Date</span>
                  <span>{source.metadata.date}</span>
                </>
              )}
              {source.metadata.venue && (
                <>
                  <span className="text-muted-foreground">Venue</span>
                  <span>{source.metadata.venue}</span>
                </>
              )}
              {source.metadata.url && (
                <>
                  <span className="text-muted-foreground">Link</span>
                  <a href={source.metadata.url} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
                    View Source <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
              <span className="text-muted-foreground">Trustworthiness</span>
              <div className="flex items-center gap-2">
                <Badge variant={source.trustworthiness === "High" ? "default" : source.trustworthiness === "Medium" ? "secondary" : "destructive"} className="w-fit">
                  {source.trustworthiness}
                </Badge>
                {source.trustworthinessReason && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help text-muted-foreground hover:text-foreground transition-colors"><Info className="h-4 w-4" /></div>
                      </TooltipTrigger>
                      <TooltipContent><p className="max-w-xs">{source.trustworthinessReason}</p></TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Engineer Notes</h4>
            <Textarea placeholder="Add your notes about this source..." className="min-h-[100px] text-sm resize-none" />
          </div>
        </div>
      </ScrollArea>

      <div className="p-6 border-t">
        <Button className="w-full gap-2" onClick={() => onOpenSource?.(source.id)}>
          Open Full View
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
