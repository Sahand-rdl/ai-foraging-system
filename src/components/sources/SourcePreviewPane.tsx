import { useEffect, useState } from "react";
import { Star, ExternalLink, ChevronRight, Heart, FileText, Table2, Image, Code, BookOpen, Cpu, Info } from "lucide-react";
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
      case "Figure": return <Image className="h-3 w-3" />;
      case "Table": return <Table2 className="h-3 w-3" />;
      case "Algo": return <Code className="h-3 w-3" />;
      case "Def": return <BookOpen className="h-3 w-3" />;
      case "Tech": return <Cpu className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
}

// Format authors - handles both array and string formats from the API
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
    <div className="w-1/3 min-w-[400px] flex flex-col gap-4 border rounded-md p-4 animate-in slide-in-from-right-10 fade-in duration-200">
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold leading-none flex items-center gap-2">
            Preview: {displayTitle}
          </h3>
          {source.isFavourite && (
            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
          )}
        </div>
      </div>

      <Separator />

      <ScrollArea className="flex-1 pr-4">
        <div className="space-y-6">
          {/* Metadata */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Metadata</h4>
            <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
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
                  <a
                    href={source.metadata.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    View Source <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}

              <span className="text-muted-foreground">Trustworthiness</span>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    source.trustworthiness === "High"
                      ? "default"
                      : source.trustworthiness === "Medium"
                      ? "secondary"
                      : "destructive"
                  }
                  className="w-fit"
                >
                  {source.trustworthiness}
                </Badge>
                {source.trustworthinessReason && (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help text-muted-foreground hover:text-foreground transition-colors">
                          <Info className="h-4 w-4" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">{source.trustworthinessReason}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            </div>
          </div>

        
          {/* Engineer Notes */}
          <div className="space-y-3">
            <Textarea
              placeholder="Add your notes about this source..."
              className="min-h-[100px] text-sm resize-none"
            />
          </div>
        </div>
      </ScrollArea>

      <div className="pt-4 mt-auto">
        <Button className="w-full gap-2" onClick={() => onOpenSource?.(source.id)}>
          Open Source
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
