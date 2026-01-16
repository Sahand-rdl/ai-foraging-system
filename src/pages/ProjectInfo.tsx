import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, FolderOpen, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
// TODO: Replace mock data imports with API calls:
// - fetchProjectById(id) for project
// - fetchResearchersByIds(ids) for researchers
// - fetchKnowledgeSourcesByProjectId(projectId) for sources
// - fetchKnowledgeArtifactsBySourceId(sourceId) for artifacts
// import { fetchProjectById, fetchResearchersByIds, fetchKnowledgeSourcesByProjectId, fetchKnowledgeArtifactsBySourceId } from "@/services/api";
import {
  mockProjects,
  mockResearchers,
  mockKnowledgeSources,
  mockKnowledgeArtifacts,
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

export default function ProjectInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  const projectId = parseInt(id || "1", 10);

  // Get project from mock data
  const project = mockProjects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  // Get researchers for this project
  const researchers = mockResearchers.filter((r) =>
    project.researcherIds.includes(r.id)
  );

  // Get sources for this project
  const sources = mockKnowledgeSources.filter((s) => s.projectId === projectId);

  // Get artifacts for this project
  const sourceIds = sources.map((s) => s.id);
  const artifacts = mockKnowledgeArtifacts.filter((a) =>
    sourceIds.includes(a.knowledgeSourceId)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Project Details</h1>
          <p className="text-muted-foreground mt-1">{project.name}</p>
        </div>
        <Badge variant="outline" className="text-sm">
          active
        </Badge>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-full bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{sources.length}</div>
              <p className="text-sm text-muted-foreground">Knowledge Sources</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-full bg-primary/10">
              <Database className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{artifacts.length}</div>
              <p className="text-sm text-muted-foreground">Knowledge Artifacts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="p-3 rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold">{researchers.length}</div>
              <p className="text-sm text-muted-foreground">Team Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ML Problem Definition */}
      <Card>
        <CardHeader>
          <CardTitle>ML Project Definition</CardTitle>
          <CardDescription>The core machine learning challenge being addressed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 bg-muted/30 rounded-lg border border-border">
            <p className="text-lg leading-relaxed text-foreground">
              {project.mlProjectDefinition}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle>Project Tags</CardTitle>
          <CardDescription>Keywords and topics associated with this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Research Team */}
      <Card>
        <CardHeader>
          <CardTitle>Research Team</CardTitle>
          <CardDescription>Collaborators working on this project</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {researchers.map((researcher) => (
              <div
                key={researcher.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm">
                    {getInitials(researcher.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{researcher.name}</div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{researcher.email}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline" className="w-full md:w-auto">
              <User className="h-4 w-4 mr-2" />
              Manage Team
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="flex gap-4">
        <Button onClick={() => navigate(`/projects/${id}`)} className="gap-2">
          <FolderOpen className="h-4 w-4" />
          View Knowledge Sources
        </Button>
        <Button variant="outline" onClick={() => navigate("/artifacts")} className="gap-2">
          <Database className="h-4 w-4" />
          View Artifacts
        </Button>
      </div>
    </div>
  );
}
