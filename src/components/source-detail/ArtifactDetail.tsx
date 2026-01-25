import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronLeft, Sparkles, Heart, X, Check, Tag, MessageSquare, Send } from "lucide-react";
import { KnowledgeArtifact } from "@/types/source";

interface ArtifactDetailProps {
  artifact: KnowledgeArtifact;
  getTypeColor: (type: string) => string;
  onBack: () => void;
  onToggleFavorite: (id: number) => void;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onRemoveTag: (id: number, tag: string) => void;
  onAddTag: (id: number, tag: string) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onSendChatMessage: (id: number) => void;
  currentMessage: string;
  onMessageChange: (message: string) => void;
  newTag: string;
  onNewTagChange: (tag: string) => void;
}

export function ArtifactDetail({
  artifact,
  getTypeColor,
  onBack,
  onToggleFavorite,
  onAccept,
  onReject,
  onRemoveTag,
  onAddTag,
  onUpdateNotes,
  onSendChatMessage,
  currentMessage,
  onMessageChange,
  newTag,
  onNewTagChange
}: ArtifactDetailProps) {
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
              {artifact.status === "suggestion" && (
                <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Suggestion
                </Badge>
              )}
            </div>
            <h2 className="text-lg font-semibold">KA: {artifact.title}</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onToggleFavorite(artifact.id)}
            className={artifact.isBookmarked ? "text-red-500" : ""}
          >
            <Heart className={`h-5 w-5 ${artifact.isBookmarked ? "fill-current" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Scrollable content area */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Content */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Content</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {artifact.content}
            </p>
          </div>

          {/* AI Actions - only show if Suggestion */}
          {artifact.status === "suggestion" && (
            <div>
              <h3 className="text-sm font-semibold mb-2">AI Generated Actions</h3>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReject(artifact.id)}
                  className=""
                >
                  <X className="h-3 w-3 mr-1" />
                  Reject
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onAccept(artifact.id)}
                >
                  <Check className="h-3 w-3 mr-1" />
                  Accept
                </Button>
              </div>
            </div>
          )}

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

      {/* Chat Section */}
      <div className="border-t border-border flex flex-col" style={{ height: '250px' }}>
        <div className="p-3 border-b border-border">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Ask about this artifact
          </h3>
        </div>
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {(artifact.chatHistory || []).map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-2 text-sm ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="p-3 border-t border-border">
          <div className="flex gap-2">
            <Input
              placeholder="Ask a question..."
              value={currentMessage}
              onChange={(e) => onMessageChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSendChatMessage(artifact.id);
                }
              }}
            />
            <Button
              size="icon"
              onClick={() => onSendChatMessage(artifact.id)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
