import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FolderOpen, Database, Users } from "lucide-react";
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

export default function Dashboard() {
  const navigate = useNavigate();

  // Compute real stats from mock data
  const stats = {
    projects: mockProjects.length,
    sources: mockKnowledgeSources.length,
    artifacts: mockKnowledgeArtifacts.length,
    researchers: mockResearchers.length,
    favouriteSources: mockKnowledgeSources.filter((s) => s.isFavourite).length,
    bookmarkedArtifacts: mockKnowledgeArtifacts.filter((a) => a.isBookmarked).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Overview of your research activity
          </p>
        </div>
        <Button className="gap-2" onClick={() => navigate("/projects")}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/projects")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active research projects
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/sources")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Sources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sources}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.favouriteSources} marked as favourite
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/artifacts")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Artifacts</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.artifacts}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.bookmarkedArtifacts} bookmarked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Researchers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.researchers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Team members
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>Your research projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockProjects.map((project) => {
              const researchers = getProjectResearchers(project.researcherIds);
              const sourceCount = getProjectSourceCount(project.id);
              const artifactCount = getProjectArtifactCount(project.id);

              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{project.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {sourceCount} sources • {artifactCount} artifacts
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex -space-x-2 ml-4">
                    {researchers.slice(0, 3).map((r) => (
                      <Avatar key={r.id} className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {getInitials(r.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {researchers.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                        +{researchers.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Researchers across all projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockResearchers.map((researcher) => {
              const projectCount = mockProjects.filter((p) =>
                p.researcherIds.includes(researcher.id)
              ).length;

              return (
                <div
                  key={researcher.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{getInitials(researcher.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{researcher.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {researcher.email}
                    </div>
                  </div>
                  <Badge variant="outline">{projectCount} projects</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
