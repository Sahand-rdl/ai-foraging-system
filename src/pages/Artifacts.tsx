import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Bookmark, Check, Image, Table2, Code, BookOpen, ExternalLink, MessageSquare, ArrowRight } from "lucide-react";
import { 
  fetchKnowledgeArtifacts, 
  fetchKnowledgeSources, 
  fetchProjects, 
  updateArtifactBookmark 
} from "@/services/api";
import { 
  type KnowledgeArtifact, 
  type KAType,
  type KnowledgeSource,
  type Project
} from "@/types/source";

// Get icon for KA type
function getTypeIcon(type: KAType) {
  switch (type) {
    case "figure": return <Image className="h-4 w-4" />;
    case "table": return <Table2 className="h-4 w-4" />;
    case "algorithm": return <Code className="h-4 w-4" />;
    case "terminology": return <BookOpen className="h-4 w-4" />;
  }
}

export default function Artifacts() {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const [usedArtifacts, setUsedArtifacts] = useState<Set<number>>(new Set());
  const [selectedTypes, setSelectedTypes] = useState<Set<KAType>>(new Set());
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  const availableTypes: KAType[] = ["terminology", "figure", "table", "algorithm"];

  useEffect(() => {
    async function loadData() {
        try {
            const [artData, srcData, prjData] = await Promise.all([
                fetchKnowledgeArtifacts(),
                fetchKnowledgeSources(),
                fetchProjects()
            ]);
            setArtifacts(artData);
            setSources(srcData);
            setProjects(prjData);
        } catch (error) {
            console.error("Failed to load artifacts data", error);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  // Helper to get source title
  const getSourceTitle = (sourceId: number): string => {
    const source = sources.find(s => s.id === sourceId);
    return source?.metadata.title || `Source #${sourceId}`;
  };

  // Helper to get project name
  const getProjectName = (sourceId: number): string => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return "Unknown Project";
    const project = projects.find(p => p.id === source.projectId);
    return project?.name || "Unknown Project";
  };

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

  const toggleBookmark = async (artifact: KnowledgeArtifact) => {
      try {
          const updated = await updateArtifactBookmark(artifact.id, !artifact.isBookmarked);
          setArtifacts(prev => prev.map(a => a.id === updated.id ? updated : a));
      } catch (error) {
          console.error("Failed to toggle bookmark", error);
      }
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

  const filteredArtifacts = artifacts.filter(artifact => {
    const typeMatch = selectedTypes.size === 0 || selectedTypes.has(artifact.type);
    const bookmarkMatch = !showBookmarkedOnly || artifact.isBookmarked;
    return typeMatch && bookmarkMatch;
  });

  const getStatusBadge = (status: KnowledgeArtifact["status"]) => {
    return status === "final" ? "default" : "secondary";
  };
  
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading artifacts...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Knowledge Artifacts</h2>
          <p className="text-muted-foreground mt-1">Browse and manage extracted knowledge artifacts</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {artifacts.length} artifacts
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
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-border pb-4">
              <Button
                variant={showBookmarkedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                className="gap-2"
              >
                <Bookmark className="h-4 w-4" />
                Bookmarked Only
              </Button>
            </div>
            
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
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/sources/${artifact.knowledgeSourceId}?aid=${artifact.id}`)}
                    className="gap-1"
                  >
                    View Source
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="shrink-0"
                    onClick={() => toggleBookmark(artifact)}
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
