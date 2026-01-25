import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KnowledgeSourcesView } from "@/components/sources";
import { 
  fetchProjectById, 
  fetchKnowledgeSourcesByProjectId 
} from "@/services/api";
import { type Project, type KnowledgeSource } from "@/types/source";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectSources, setProjectSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      const projectId = parseInt(id, 10);
      try {
        const [projectData, sourcesData] = await Promise.all([
          fetchProjectById(projectId),
          fetchKnowledgeSourcesByProjectId(projectId)
        ]);
        
        if (projectData) {
            setProject(projectData);
        }
        setProjectSources(sourcesData);
      } catch (error) {
        console.error("Failed to load project details", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
     return <div className="p-8 text-center text-muted-foreground">Loading project...</div>;
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <h2 className="text-2xl font-bold">Project not found</h2>
        <Button onClick={() => navigate("/projects")}>Go to Projects</Button>
      </div>
    );
  }

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
