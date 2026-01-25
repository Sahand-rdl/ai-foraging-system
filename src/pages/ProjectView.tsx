import { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Info, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AddSourceModal, KnowledgeSourcesView } from "@/components/sources";
import { 
  fetchProjectById, 
  fetchKnowledgeSourcesByProjectId 
} from "@/services/api";
import { type Project, type KnowledgeSource } from "@/types/source";

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [projectSources, setProjectSources] = useState<KnowledgeSource[]>([]);
  const [loading, setLoading] = useState(true);
    const [isAddSourceOpen, setIsAddSourceOpen] = useState(false);

   const loadData = useCallback(async () => {
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
    }, [id]);
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
        console.error("Failed to load project view", error);
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
      <div className="flex items-center gap-4 shrink-0 px-1 pt-2">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            <Badge variant="outline" className="text-sm">
              {projectSources.length} sources
            </Badge>
          </div>
        </div>
        
        {/* Right side actions */}
        <div className="flex items-center gap-2">
          <div className="relative w-64">
             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input placeholder="Search sources..." className="pl-8 h-9" />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9">
             <Filter className="h-4 w-4" />
           </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => navigate(`/projects/${id}/details`)}>
            <Info className="h-4 w-4 mr-2" />
            Project Details
          </Button>
          <AddSourceModal 
                      projectId={project.id} 
                      open={isAddSourceOpen}
                      onOpenChange={setIsAddSourceOpen}
                      onSuccess={loadData}
                      trigger={
                        <Button size="sm" className="h-9">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Source
                        </Button>
                      }
                    />
        </div>
      </div>

      {/* Knowledge Sources View */}
      <div className="flex-1 min-h-0">
        <KnowledgeSourcesView
          sources={projectSources}
          showHeader={false}
          getSourceTitle={(source) => source.metadata.title || `Source #${source.id}`}
        />
      </div>
    </div>
  );
}
