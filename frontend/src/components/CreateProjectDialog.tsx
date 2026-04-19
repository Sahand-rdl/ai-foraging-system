import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Loader2 } from "lucide-react";
import { createProject, fetchResearchers } from "@/services/api";
import { type Researcher, type Project } from "@/types/source";

import { useProjects } from "@/contexts/ProjectsContext";

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated?: (project: Project) => void;
}

export function CreateProjectDialog({
  open,
  onOpenChange,
  onProjectCreated,
}: CreateProjectDialogProps) {
  const { refreshProjects } = useProjects();
  const [name, setName] = useState("");
  const [mlProblemDefinition, setMlProblemDefinition] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectedResearcherIds, setSelectedResearcherIds] = useState<number[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      fetchResearchers()
        .then(setResearchers)
        .catch((err) => console.error("Failed to load researchers", err));
    }
  }, [open]);

  const handleAddTag = () => {
    const trimmed = tagsInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagsInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const toggleResearcher = (id: number) => {
    if (selectedResearcherIds.includes(id)) {
      setSelectedResearcherIds(selectedResearcherIds.filter((r) => r !== id));
    } else {
      setSelectedResearcherIds([...selectedResearcherIds, id]);
    }
  };

  const resetForm = () => {
    setName("");
    setMlProblemDefinition("");
    setTagsInput("");
    setTags([]);
    setSelectedResearcherIds([]);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }
    if (!mlProblemDefinition.trim()) {
      setError("ML Problem Definition is required");
      return;
    }

    setIsLoading(true);
    try {
      const newProject = await createProject({
        name: name.trim(),
        mlProjectDefinition: mlProblemDefinition.trim(),
        tags,
        researcherIds: selectedResearcherIds,
      });
      await refreshProjects();
      resetForm();
      onOpenChange(false);
      onProjectCreated?.(newProject);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Define a new research project with its ML problem statement.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="project-name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Machine Learning in Healthcare"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ml-problem">
              ML Problem Definition <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="ml-problem"
              value={mlProblemDefinition}
              onChange={(e) => setMlProblemDefinition(e.target.value)}
              placeholder="Describe the machine learning problem this project aims to solve..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Add a tag and press Enter"
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Team Members (optional)</Label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
              {researchers.length === 0 ? (
                <span className="text-sm text-muted-foreground">No researchers available</span>
              ) : (
                researchers.map((r) => (
                  <Badge
                    key={r.id}
                    variant={selectedResearcherIds.includes(r.id) ? "default" : "outline"}
                    className="cursor-pointer transition-colors"
                    onClick={() => toggleResearcher(r.id)}
                  >
                    {r.name}
                  </Badge>
                ))
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Project
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
