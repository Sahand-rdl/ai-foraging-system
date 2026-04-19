import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, FolderOpen, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  fetchProjectById, 
  fetchResearchersByIds, 
  fetchKnowledgeSourcesByProjectId, 
  fetchKnowledgeArtifacts 
} from "@/services/api";
import {
  type Project,
  type Researcher,
  type KnowledgeSource,
  type KnowledgeArtifact,
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

  const [project, setProject] = useState<Project | null>(null);
  const [researchers, setResearchers] = useState<Researcher[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     async function loadData() {
        if (!id) return;
        const projectId = parseInt(id, 10);
        try {
           const projectData = await fetchProjectById(projectId);
           if (!projectData) {
              setProject(null);
              setLoading(false);
              return;
           }
           setProject(projectData);

           const [fetchedSources, fetchedResearchers, allArtifacts] = await Promise.all([
               fetchKnowledgeSourcesByProjectId(projectId),
               fetchResearchersByIds(projectData.researcherIds),
               fetchKnowledgeArtifacts() // We fetch all then filter, or improvement: fetch by sources
           ]);
           
           setSources(fetchedSources);
           setResearchers(fetchedResearchers);

           const sourceIds = fetchedSources.map(s => s.id);
           const projectArtifacts = allArtifacts.filter(a => sourceIds.includes(a.knowledgeSourceId));
           setArtifacts(projectArtifacts);

        } catch (error) {
           console.error("Failed to load project info", error);
        } finally {
            setLoading(false);
        }
     }
     loadData();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

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

      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        {/* Removed Researchers Card
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
        */}
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

      {/* Research Team (Temporarily Hidden)
      */}
      {/* Moved this comment here for clarity, it previously surrounded the card
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
      */}

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
