import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, Sparkles, Heart, X, Check, Tag, ExternalLink, Bookmark, Link } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { KnowledgeArtifact } from "@/types/source";

interface ArtifactDetailProps {
  artifact: KnowledgeArtifact;
  getTypeColor: (type: string) => string;
  onBack: () => void;
  onToggleFavorite: (id: number) => void;
  onStatusChange: (id: number, status: "suggestion" | "final") => void;
  onRemoveTag: (id: number, tag: string) => void;
  onAddTag: (id: number, tag: string) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  newTag: string;
  onNewTagChange: (tag: string) => void;
  onUpdateContent?: (id: number, content: string) => void;
  onAccept?: (id: number) => void;
  onDecline?: (id: number) => void;
  onUpdateExternalLink?: (id: number, link: string) => void;
}

export function ArtifactDetail({
  artifact,
  getTypeColor,
  onBack,
  onToggleFavorite,
  onStatusChange,
  onRemoveTag,
  onAddTag,
  onUpdateNotes,
  newTag,
  onNewTagChange,
  onUpdateContent,
  onAccept,
  onDecline,
  onUpdateExternalLink
}: ArtifactDetailProps) {
  const isSuggestion = artifact.status === "suggestion";

  const { toast } = useToast();

  const handleCopyLink = () => {
    const url = new URL(window.location.href);
    url.searchParams.set("aid", artifact.id.toString());
    navigator.clipboard.writeText(url.toString());
    toast({
      title: "Link copied",
      description: "Artifact link copied to clipboard",
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header with back button */}
      <div className="p-4 border-b border-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="mb-3"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to List
        </Button>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-muted-foreground">ID {artifact.id}</span>
              <Badge variant={getTypeColor(artifact.type) as any} className="text-xs">
                {artifact.type}
              </Badge>

              <Select
                value={artifact.status}
                onValueChange={(value) => onStatusChange(artifact.id, value as "suggestion" | "final")}
              >
                <SelectTrigger className="h-6 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="suggestion">
                    <div className="flex items-center">
                      <Sparkles className="h-3 w-3 mr-2" />
                      Suggestion
                    </div>
                  </SelectItem>
                  <SelectItem value="final">
                    <div className="flex items-center">
                      <Check className="h-3 w-3 mr-2" />
                      Final
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <h2 className="text-lg font-semibold">KA: {artifact.title}</h2>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyLink}
              className="text-muted-foreground hover:text-foreground"
            >
              <Link className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleFavorite(artifact.id)}
              className={artifact.isBookmarked ? "text-yellow-500" : ""}
            >
              <Bookmark className={`h-5 w-5 ${artifact.isBookmarked ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Content */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Content</h3>
            <Textarea 
              value={artifact.content} 
              onChange={(e) => onUpdateContent?.(artifact.id, e.target.value)}
              className="min-h-[150px] font-mono text-sm leading-relaxed"
            />
            {isSuggestion && (
              <div className="flex gap-2 mt-2 justify-end">
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={() => onDecline?.(artifact.id)}
                >
                  <X className="h-3 w-3 mr-1" />
                  Decline
                </Button>
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => onAccept?.(artifact.id)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
              </div>
            )}
          </div>

          <div>
             <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              External Link
            </h3>
            <Input
              placeholder="https://example.com"
              value={artifact.externalLink || ""}
              onChange={(e) => onUpdateExternalLink?.(artifact.id, e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tags
            </h3>
            <div className="flex flex-wrap gap-2 mb-2">
              {artifact.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    onClick={() => onRemoveTag(artifact.id, tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag..."
                value={newTag}
                onChange={(e) => onNewTagChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onAddTag(artifact.id, newTag);
                  }
                }}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => onAddTag(artifact.id, newTag)}
              >
                Add
              </Button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Notes</h3>
            <Textarea
              placeholder="Add your notes here..."
              value={artifact.notes || ""}
              onChange={(e) => onUpdateNotes(artifact.id, e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>

      </ScrollArea>

    </div>
  );
}