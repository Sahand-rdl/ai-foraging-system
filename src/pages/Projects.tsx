import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, FileText, Database, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  fetchResearchers, 
  fetchKnowledgeSources,
  fetchKnowledgeArtifacts,
  deleteProject
} from "@/services/api";
import {
  type Project,
  type Researcher,
} from "@/types/source";
import { useProjects } from "@/contexts/ProjectsContext";
import { CreateProjectDialog } from "@/components/CreateProjectDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

// Helper to get researcher initials
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Projects() {
  const navigate = useNavigate();
  const { projects, refreshProjects } = useProjects();
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [projectCounts, setProjectCounts] = useState<Record<number, { sources: number; artifacts: number }>>({});
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [researchersData, allSources, allArtifacts] = await Promise.all([
          fetchResearchers(),
          fetchKnowledgeSources(),
          fetchKnowledgeArtifacts(),
        ]);
        
        setResearchers(researchersData);

        const counts: Record<number, { sources: number; artifacts: number }> = {};
        projects.forEach(p => {
            const pSources = allSources.filter(s => s.projectId === p.id);
            const pSourceIds = pSources.map(s => s.id);
            const pArtifacts = allArtifacts.filter(a => pSourceIds.includes(a.knowledgeSourceId));
            counts[p.id] = {
                sources: pSources.length,
                artifacts: pArtifacts.length
            };
        });
        setProjectCounts(counts);

      } catch (error) {
        console.error("Failed to load projects data", error);
      }
    }
    loadData();
  }, [projects]); // Re-run when projects change

  const handleProjectCreated = () => {
    // Context handles refresh, but we might want to re-fetch other data if needed
    // For now, the useEffect [projects] dependency will handle recomputing counts
  };

  const handleDeleteProject = async (e: React.MouseEvent, projectId: number) => {
    e.stopPropagation(); // Prevent card navigation
    if (!confirm("Are you sure you want to delete this project?")) return;
    
    try {
      await deleteProject(projectId);
      toast.success("Project deleted successfully");
      await refreshProjects();
    } catch (error) {
      console.error("Failed to delete project", error);
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground mt-1">Manage your research projects</p>
        </div>
        <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => {
          const projectResearchers = researchers.filter(r => project.researcherIds.includes(r.id));
          const counts = projectCounts[project.id] || { sources: 0, artifacts: 0 };

          return (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      active
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive cursor-pointer"
                        onClick={(e) => handleDeleteProject(e, project.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription className="line-clamp-2">
                  {project.mlProjectDefinition}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{counts.sources} sources</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" />
                    <span>{counts.artifacts} artifacts</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {project.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {project.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{project.tags.length - 3}
                    </Badge>
                  )}
                </div>

                {/* Researchers */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">Team</span>
                  <div className="flex -space-x-2">
                    {projectResearchers.slice(0, 4).map((r) => (
                      <Avatar
                        key={r.id}
                        className="h-7 w-7 border-2 border-background"
                        title={r.name}
                      >
                        <AvatarFallback className="text-[10px]">
                          {getInitials(r.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {projectResearchers.length > 4 && (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                        +{projectResearchers.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <CreateProjectDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}
