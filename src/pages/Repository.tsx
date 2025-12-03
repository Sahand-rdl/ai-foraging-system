import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, BookmarkPlus, Check } from "lucide-react";

export default function Repository() {
  const [usedArtifacts, setUsedArtifacts] = useState<Set<number>>(new Set());
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const availableTags = [
    "terminologies",
    "figures", 
    "definitions",
    "methodologies",
    "results",
    "datasets"
  ];
  const artifacts = [
    {
      id: 1,
      content: "Convolutional neural networks have shown 95% accuracy in detecting lung cancer from CT scans...",
      source: "Deep Learning for Medical Image Analysis",
      project: "Machine Learning in Healthcare",
      tags: ["CNN", "diagnostics", "lung cancer", "accuracy"],
      relevance: "high",
    },
    {
      id: 2,
      content: "Shor's algorithm demonstrates polynomial-time factorization on quantum computers, threatening RSA encryption...",
      source: "Quantum Algorithms for Cryptographic Applications",
      project: "Quantum Computing Applications",
      tags: ["quantum", "cryptography", "Shor's algorithm", "RSA"],
      relevance: "high",
    },
    {
      id: 3,
      content: "Direct air capture technology can remove CO2 at costs projected to reach $100 per ton by 2030...",
      source: "Carbon Capture Technologies",
      project: "Climate Change Mitigation",
      tags: ["carbon capture", "DAC", "cost analysis"],
      relevance: "medium",
    },
    {
      id: 4,
      content: "Transfer learning reduces training time by 60% while maintaining model performance in medical imaging tasks...",
      source: "Neural Network Architectures in Healthcare",
      project: "Machine Learning in Healthcare",
      tags: ["transfer learning", "training efficiency", "medical imaging"],
      relevance: "high",
    },
    {
      id: 5,
      content: "Post-quantum cryptographic algorithms show resistance to known quantum attacks while maintaining practical performance...",
      source: "Quantum Algorithms for Cryptographic Applications",
      project: "Quantum Computing Applications",
      tags: ["post-quantum", "cryptography", "security"],
      relevance: "medium",
    },
    {
      id: 6,
      content: "Renewable energy storage solutions using lithium-ion batteries have improved efficiency by 40% since 2020...",
      source: "Carbon Capture Technologies",
      project: "Climate Change Mitigation",
      tags: ["renewable energy", "storage", "batteries", "efficiency"],
      relevance: "high",
    },
  ];

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

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  };

  const filteredArtifacts = selectedTags.size === 0 
    ? artifacts 
    : artifacts.filter(artifact => 
        artifact.tags.some(tag => selectedTags.has(tag))
      );

  const getRelevanceBadge = (relevance: string) => {
    const colors = {
      high: "default",
      medium: "secondary",
      low: "outline",
    };
    return colors[relevance as keyof typeof colors] || "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Knowledge Repository</h2>
          <p className="text-muted-foreground mt-1">Browse and search extracted knowledge artifacts</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Repository</CardTitle>
          <CardDescription>Find knowledge artifacts by content, tags, or source</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Filter by Tag</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <Button
                  key={tag}
                  variant={selectedTags.has(tag) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleTag(tag)}
                  className="text-xs"
                >
                  {tag}
                </Button>
              ))}
              {selectedTags.size > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedTags(new Set())}
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
          <Card key={artifact.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getRelevanceBadge(artifact.relevance) as any}>
                      {artifact.relevance} relevance
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    {artifact.content}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button 
                    variant={usedArtifacts.has(artifact.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleUsed(artifact.id)}
                    className={usedArtifacts.has(artifact.id) ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
                  >
                    {usedArtifacts.has(artifact.id) && <Check className="h-3 w-3 mr-1" />}
                    {usedArtifacts.has(artifact.id) ? "Used" : "Use This"}
                  </Button>
                  <Button variant="ghost" size="icon" className="shrink-0">
                    <BookmarkPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {artifact.tags.map((tag, j) => (
                    <Badge key={j} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
                  <span>Source: <span className="text-foreground">{artifact.source}</span></span>
                  <span>Project: <span className="text-foreground">{artifact.project}</span></span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
