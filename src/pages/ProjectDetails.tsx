import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KnowledgeSourcesView } from "@/components/sources";
import { mockKnowledgeSources, mockProjects } from "@/types/source";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Get project from mock data
  const projectId = parseInt(id || "1", 10);
  const project = mockProjects.find((p) => p.id === projectId) || {
    id: projectId,
    name: "Unknown Project",
    mlProjectDefinition: "",
    knowledgeSourceIds: [],
    researcherIds: [],
    tags: [],
  };

  // Filter sources for this project
  const projectSources = mockKnowledgeSources.filter(
    (s) => s.projectId === projectId
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3rem)] gap-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 shrink-0">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <Badge variant="outline" className="text-sm">
              {projectSources.length} sources
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 line-clamp-1">
            {project.mlProjectDefinition}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${id}/details`)}>
            <Info className="h-4 w-4 mr-2" />
            Project Details
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Knowledge Sources View */}
      <div className="flex-1 min-h-0">
        <KnowledgeSourcesView
          sources={projectSources}
          title="Project Knowledge Sources"
          description="Academic papers and documents linked to this project"
          getSourceTitle={(source) => source.metadata.title || `Source #${source.id}`}
        />
      </div>
    </div>
  );
}
