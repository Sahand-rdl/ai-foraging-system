import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchKnowledgeArtifacts } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { KAType } from "@/types/source";
import { Loader2, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AddArtifactFormProps {
  knowledgeSourceId: number;
  onCancel: () => void;
  onSuccess: () => void;
}

export function AddArtifactForm({
  knowledgeSourceId,
  onCancel,
  onSuccess,
}: AddArtifactFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [type, setType] = useState<KAType>("terminology");
  const [content, setContent] = useState("");
  const [externalLink, setExternalLink] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      await createKnowledgeArtifact({
        knowledge_source_id: knowledgeSourceId,
        title,
        type,
        content,
        external_link: externalLink || undefined,
        notes: notes || undefined,
        tags: tags || undefined,
        status: "final",
      });

      toast({
        title: "Success",
        description: "Artifact created successfully.",
      });

      // Reset works implicitly by unmounting, but if kept mounted:
      setTitle("");
      setType("terminology");
      setContent("");
      setExternalLink("");
      setNotes("");
      setTags("");

      onSuccess();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create artifact.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border p-4 flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onCancel}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-semibold text-sm">New Artifact</h3>
      </div>

      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Transformer Architecture"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as KAType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="terminology">Terminology</SelectItem>
                <SelectItem value="figure">Figure</SelectItem>
                <SelectItem value="table">Table</SelectItem>
                <SelectItem value="algorithm">Algorithm</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the main content or description of the artifact..."
              className="min-h-[150px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="external-link">External Link</Label>
            <Input
              id="external-link"
              value={externalLink}
              onChange={(e) => setExternalLink(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ai, architecture, deep learning"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !title || !content}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Artifact
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  );
}
