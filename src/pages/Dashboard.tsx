import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FolderOpen, Database, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  fetchProjects, 
  fetchResearchers, 
  fetchDashboardStats,
  type DashboardStats,
  fetchKnowledgeSourcesByProjectId,
  fetchKnowledgeArtifactsBySourceId,
  fetchKnowledgeSources,
  fetchKnowledgeArtifacts
} from "@/services/api";
import {
  type Project,
  type Researcher,
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    projects: 0,
    sources: 0,
    artifacts: 0,
    researchers: 0,
    favouriteSources: 0,
    bookmarkedArtifacts: 0,
  });
  const [projects, setProjects] = useState<Project[]>([]);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  // We need counts per project, which might differ from global stats
  const [projectCounts, setProjectCounts] = useState<Record<number, { sources: number; artifacts: number }>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, projectsData, researchersData] = await Promise.all([
          fetchDashboardStats(),
          fetchProjects(),
          fetchResearchers(),
        ]);
        
        setStats(statsData);
        setProjects(projectsData);
        setResearchers(researchersData);

        // Load project specific counts (this could be optimized if backend returns it)
        // Ideally backend Project schema includes counts.
        // For now, we fetch sources/artifacts for each project or use the global lists if cached.
        // Since we don't have global cache yet, we'll implement a lighter check.
        // Actually, Project schema likely has source IDs or we can infer from global lists if we fetch all.
        // Let's fetch all sources and artifacts to compute counts locally for the dashboard view
        // to avoid N+1 requests if the dashboard is high traffic.
        // Or just rely on what we have.
        
        const allSources = await fetchKnowledgeSources();
        const allArtifacts = await fetchKnowledgeArtifacts();
        
        const counts: Record<number, { sources: number; artifacts: number }> = {};
        projectsData.forEach(p => {
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
        console.error("Failed to load dashboard data", error);
      }
    }
    loadData();
  }, []);

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
            {projects.map((project) => {
              const projectResearchers = researchers.filter(r => project.researcherIds.includes(r.id));
              const counts = projectCounts[project.id] || { sources: 0, artifacts: 0 };

              return (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{project.name}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {counts.sources} sources • {counts.artifacts} artifacts
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
                    {projectResearchers.slice(0, 3).map((r) => (
                      <Avatar key={r.id} className="h-8 w-8 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          {getInitials(r.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {projectResearchers.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                        +{projectResearchers.length - 3}
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
            {researchers.map((researcher) => {
              const projectCount = projects.filter((p) =>
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
