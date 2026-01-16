import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Bookmark, Check, Image, Table2, Code, BookOpen, Cpu, ExternalLink, MessageSquare } from "lucide-react";
// TODO: Replace mock data imports with API calls:
// - fetchKnowledgeArtifacts() for mockKnowledgeArtifacts
// - fetchKnowledgeSources() for mockKnowledgeSources (source lookup)
// - fetchProjects() for mockProjects (project lookup)
// - updateArtifactBookmark(id, isBookmarked) for bookmark toggle
// import { fetchKnowledgeArtifacts, fetchKnowledgeSources, fetchProjects, updateArtifactBookmark } from "@/services/api";
import { mockKnowledgeArtifacts, mockKnowledgeSources, mockProjects, type KnowledgeArtifact, type KAType } from "@/types/source";

// Get source title from source ID
function getSourceTitle(sourceId: number): string {
  const source = mockKnowledgeSources.find(s => s.id === sourceId);
  return source?.metadata.title || `Source #${sourceId}`;
}

// Get project name from source ID
function getProjectName(sourceId: number): string {
  const source = mockKnowledgeSources.find(s => s.id === sourceId);
  if (!source) return "Unknown Project";
  const project = mockProjects.find(p => p.id === source.projectId);
  return project?.name || "Unknown Project";
}

// Get icon for KA type
function getTypeIcon(type: KAType) {
  switch (type) {
    case "Figure": return <Image className="h-4 w-4" />;
    case "Table": return <Table2 className="h-4 w-4" />;
    case "Algo": return <Code className="h-4 w-4" />;
    case "Def": return <BookOpen className="h-4 w-4" />;
    case "Tech": return <Cpu className="h-4 w-4" />;
  }
}

export default function Artifacts() {
  const [usedArtifacts, setUsedArtifacts] = useState<Set<number>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<KAType>>(new Set());

  const availableTypes: KAType[] = ["Figure", "Table", "Algo", "Def", "Tech"];

  const toggleUsed = (id: number) => {
    setUsedArtifacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleType = (type: KAType) => {
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  const filteredArtifacts = selectedTypes.size === 0 
    ? mockKnowledgeArtifacts 
    : mockKnowledgeArtifacts.filter(artifact => selectedTypes.has(artifact.type));

  const getStatusBadge = (status: KnowledgeArtifact["status"]) => {
    return status === "final" ? "default" : "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Knowledge Artifacts</h2>
          <p className="text-muted-foreground mt-1">Browse and manage extracted knowledge artifacts</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {mockKnowledgeArtifacts.length} artifacts
        </Badge>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search artifacts..." className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Filter by Type</p>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedTypes.has(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleType(type)}
                  className="text-xs gap-1"
                >
                  {getTypeIcon(type)}
                  {type}
                </Button>
              ))}
              {selectedTypes.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTypes(new Set())}
                  className="text-xs text-muted-foreground"
                >
                  Clear all
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredArtifacts.map((artifact) => (
          <Card key={artifact.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="gap-1">
                      {getTypeIcon(artifact.type)}
                      {artifact.type}
                    </Badge>
                    <Badge variant={getStatusBadge(artifact.status)}>
                      {artifact.status}
                    </Badge>
                    {artifact.isBookmarked && (
                      <Bookmark className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    )}
                    {artifact.externalLink && (
                      <a 
                        href={artifact.externalLink} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3 w-3" />
                        Link
                      </a>
                    )}
                    {artifact.chatHistory.length > 0 && (
                      <Badge variant="outline" className="gap-1 text-xs">
                        <MessageSquare className="h-3 w-3" />
                        {artifact.chatHistory.length} messages
                      </Badge>
                    )}
                  </div>
                  <h3 className="font-semibold text-foreground">{artifact.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {artifact.content}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant={usedArtifacts.has(artifact.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleUsed(artifact.id)}
                    className={usedArtifacts.has(artifact.id) ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  >
                    {usedArtifacts.has(artifact.id) && <Check className="h-3 w-3 mr-1" />}
                    {usedArtifacts.has(artifact.id) ? "Used" : "Use This"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0"
                    onClick={() => {/* Toggle bookmark */}}
                  >
                    <Bookmark className={`h-4 w-4 ${artifact.isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {artifact.tags.map((tag, j) => (
                    <Badge key={j} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                {artifact.notes && (
                  <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                    {artifact.notes}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>
                    Source: <span className="text-foreground">{getSourceTitle(artifact.knowledgeSourceId)}</span>
                  </span>
                  <span>
                    Project: <span className="text-foreground">{getProjectName(artifact.knowledgeSourceId)}</span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
