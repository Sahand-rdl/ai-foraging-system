import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, FileText, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  mockProjects,
  mockKnowledgeSources,
  mockKnowledgeArtifacts,
  mockResearchers,
} from "@/types/source";

// Helper to get researcher initials
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Helper to get researchers for a project
function getProjectResearchers(researcherIds: number[]) {
  return mockResearchers.filter((r) => researcherIds.includes(r.id));
}

// Helper to get source count for a project
function getProjectSourceCount(projectId: number) {
  return mockKnowledgeSources.filter((s) => s.projectId === projectId).length;
}

// Helper to get artifact count for a project
function getProjectArtifactCount(projectId: number) {
  const sourceIds = mockKnowledgeSources
    .filter((s) => s.projectId === projectId)
    .map((s) => s.id);
  return mockKnowledgeArtifacts.filter((a) =>
    sourceIds.includes(a.knowledgeSourceId)
  ).length;
}

export default function Projects() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground mt-1">Manage your research projects</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {mockProjects.map((project) => {
          const researchers = getProjectResearchers(project.researcherIds);
          const sourceCount = getProjectSourceCount(project.id);
          const artifactCount = getProjectArtifactCount(project.id);

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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
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
                    <span>{sourceCount} sources</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Database className="h-4 w-4" />
                    <span>{artifactCount} artifacts</span>
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
                    {researchers.slice(0, 4).map((r) => (
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
                    {researchers.length > 4 && (
                      <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-[10px] border-2 border-background">
                        +{researchers.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
