import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Copy, X, Check, Sparkles, Heart, Tag, MessageSquare, Send, ChevronLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// TODO: Replace local state mutations with API calls:
// - fetchKnowledgeSourceById(id) for source and artifacts data
// - updateArtifactStatus(id, status) for handleAccept/handleReject
// - updateArtifactBookmark(id, isBookmarked) for toggleFavorite
// - addArtifactTag(id, tag) for addTag
// - removeArtifactTag(id, tag) for removeTag
// - updateArtifactNotes(id, notes) for updateNotes
// - sendArtifactChatMessage(artifactId, message) for sendChatMessage
// import { fetchKnowledgeSourceById, updateArtifactStatus, updateArtifactBookmark, addArtifactTag, removeArtifactTag, updateArtifactNotes, sendArtifactChatMessage } from "@/services/api";

type KACategory = "definitions" | "figures" | "methodologies";
type KASource = "ai-generated" | "user-created";

interface ExtractedArtifact {
  id: number;
  cardNumber: number;
  title: string;
  content: string;
  type: "definition" | "figure" | "methodology" | "terminology";
  category: KACategory;
  source: KASource;
  status: "pending" | "accepted" | "rejected";
}

interface ArtifactMetadata {
  isFavorite: boolean;
  tags: string[];
  notes: string;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function SourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [selectedFilter, setSelectedFilter] = useState<KACategory | "all">("all");
  const [selectedArtifactId, setSelectedArtifactId] = useState<number | null>(null);
  const [artifactMetadata, setArtifactMetadata] = useState<Record<number, ArtifactMetadata>>({});
  const [chatMessages, setChatMessages] = useState<Record<number, ChatMessage[]>>({});
  const [currentMessage, setCurrentMessage] = useState("");
  const [newTag, setNewTag] = useState("");
  const [artifacts, setArtifacts] = useState<ExtractedArtifact[]>([
    {
      id: 1,
      cardNumber: 1,
      title: "Multi-Head Attention Definition",
      content: "Multi-head attention definition is snippet of the mechanism to constitute attention.",
      type: "definition",
      category: "definitions",
      source: "ai-generated",
      status: "pending"
    },
    {
      id: 2,
      cardNumber: 2,
      title: "Architecture Diagram",
      content: "The Transformer model architecture diagram showing encoder and decoder stacks with multi-head attention layers.",
      type: "figure",
      category: "figures",
      source: "ai-generated",
      status: "pending"
    },
    {
      id: 3,
      cardNumber: 3,
      title: "Positional Encoding Method",
      content: "Positional encoding using sine and cosine functions to inject sequence order information.",
      type: "methodology",
      category: "methodologies",
      source: "user-created",
      status: "accepted"
    },
    {
      id: 4,
      cardNumber: 4,
      title: "Scaled Dot-Product Attention",
      content: "The attention function operates on queries, keys, and values. The output is computed as a weighted sum of the values.",
      type: "definition",
      category: "definitions",
      source: "user-created",
      status: "accepted"
    },
    {
      id: 5,
      cardNumber: 5,
      title: "Layer Normalization",
      content: "Layer normalization is applied after each sub-layer in the encoder and decoder stacks.",
      type: "methodology",
      category: "methodologies",
      source: "ai-generated",
      status: "pending"
    },
    {
      id: 6,
      cardNumber: 6,
      title: "Attention Weights Visualization",
      content: "Heatmap showing attention weights between query and key positions in the sequence.",
      type: "figure",
      category: "figures",
      source: "user-created",
      status: "accepted"
    },
    {
      id: 7,
      cardNumber: 7,
      title: "Feed-Forward Network",
      content: "Each layer contains a fully connected feed-forward network applied to each position separately and identically.",
      type: "definition",
      category: "definitions",
      source: "ai-generated",
      status: "pending"
    },
    {
      id: 8,
      cardNumber: 8,
      title: "Training Data Processing Pipeline",
      content: "Byte-pair encoding tokenization followed by batching with dynamic padding strategy.",
      type: "methodology",
      category: "methodologies",
      source: "ai-generated",
      status: "pending"
    }
  ]);

  const filteredArtifacts = selectedFilter === "all" 
    ? artifacts 
    : artifacts.filter(a => a.category === selectedFilter);

  const handleAccept = (artifactId: number) => {
    setArtifacts(prev => 
      prev.map(a => a.id === artifactId ? { ...a, status: "accepted" as const, source: "user-created" as const } : a)
    );
  };

  const handleReject = (artifactId: number) => {
    setArtifacts(prev => 
      prev.map(a => a.id === artifactId ? { ...a, status: "rejected" as const } : a)
    );
  };

  const getMetadata = (artifactId: number): ArtifactMetadata => {
    return artifactMetadata[artifactId] || { isFavorite: false, tags: [], notes: "" };
  };

  const toggleFavorite = (artifactId: number) => {
    setArtifactMetadata(prev => ({
      ...prev,
      [artifactId]: {
        ...getMetadata(artifactId),
        isFavorite: !getMetadata(artifactId).isFavorite
      }
    }));
  };

  const addTag = (artifactId: number, tag: string) => {
    if (!tag.trim()) return;
    const metadata = getMetadata(artifactId);
    if (!metadata.tags.includes(tag)) {
      setArtifactMetadata(prev => ({
        ...prev,
        [artifactId]: {
          ...metadata,
          tags: [...metadata.tags, tag]
        }
      }));
    }
    setNewTag("");
  };

  const removeTag = (artifactId: number, tagToRemove: string) => {
    const metadata = getMetadata(artifactId);
    setArtifactMetadata(prev => ({
      ...prev,
      [artifactId]: {
        ...metadata,
        tags: metadata.tags.filter(t => t !== tagToRemove)
      }
    }));
  };

  const updateNotes = (artifactId: number, notes: string) => {
    setArtifactMetadata(prev => ({
      ...prev,
      [artifactId]: {
        ...getMetadata(artifactId),
        notes
      }
    }));
  };

  const sendChatMessage = (artifactId: number) => {
    if (!currentMessage.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now(),
      role: "user",
      content: currentMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => ({
      ...prev,
      [artifactId]: [...(prev[artifactId] || []), userMessage]
    }));
    
    setCurrentMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: "This is a simulated response about the artifact. In a real implementation, this would be an AI-powered answer to your question.",
        timestamp: new Date()
      };
      
      setChatMessages(prev => ({
        ...prev,
        [artifactId]: [...(prev[artifactId] || []), aiMessage]
      }));
    }, 1000);
  };

  const selectedArtifact = artifacts.find(a => a.id === selectedArtifactId);

  const source = {
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    date: "2017-06-12",
    venue: "NeurIPS 2017",
    pdfUrl: "https://arxiv.org/pdf/1706.03762.pdf"
  };

  const getTypeColor = (type: string) => {
    const colors = {
      definition: "default",
      figure: "secondary",
      methodology: "outline",
      terminology: "outline"
    };
    return colors[type as keyof typeof colors] || "outline";
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/sources")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Source Viewer & Extraction</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* PDF Viewer */}
        <ResizablePanel defaultSize={60} minSize={30}>
          <div className="h-full bg-muted/30 overflow-hidden">
            <iframe
              src={source.pdfUrl}
              className="w-full h-full"
              title="PDF Viewer"
            />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* AI Extraction Sidebar */}
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full border-l border-border bg-card flex flex-col">
            
            {/* Show detailed view if an artifact is selected, otherwise show list */}
            {selectedArtifactId && selectedArtifact ? (
              // Detailed Artifact View
              <div className="h-full flex flex-col">
                {/* Header with back button */}
                <div className="p-4 border-b border-border">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedArtifactId(null)}
                    className="mb-3"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Back to List
                  </Button>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-muted-foreground">Card {selectedArtifact.cardNumber}</span>
                        <Badge variant={getTypeColor(selectedArtifact.type) as any} className="text-xs">
                          {selectedArtifact.type}
                        </Badge>
                        {selectedArtifact.source === "ai-generated" && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                            <Sparkles className="h-3 w-3 mr-1" />
                            AI
                          </Badge>
                        )}
                      </div>
                      <h2 className="text-lg font-semibold">KA: {selectedArtifact.title}</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedArtifact.id)}
                      className={getMetadata(selectedArtifact.id).isFavorite ? "text-red-500" : ""}
                    >
                      <Heart className={`h-5 w-5 ${getMetadata(selectedArtifact.id).isFavorite ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </div>

                {/* Scrollable content area */}
                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-6">
                    {/* Content */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Content</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedArtifact.content}
                      </p>
                    </div>

                    {/* AI Actions - only show if AI-generated */}
                    {selectedArtifact.source === "ai-generated" && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">AI Generated Actions</h3>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(selectedArtifact.id)}
                            disabled={selectedArtifact.status === "rejected"}
                            className={selectedArtifact.status === "rejected" ? "text-destructive" : ""}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleAccept(selectedArtifact.id)}
                            disabled={selectedArtifact.status === "accepted"}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Accept
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {getMetadata(selectedArtifact.id).tags.map((tag, idx) => (
                          <Badge key={idx} variant="secondary" className="gap-1">
                            {tag}
                            <button
                              onClick={() => removeTag(selectedArtifact.id, tag)}
                              className="ml-1 hover:text-destructive"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              addTag(selectedArtifact.id, newTag);
                            }
                          }}
                          className="flex-1"
                        />
                        <Button
                          size="sm"
                          onClick={() => addTag(selectedArtifact.id, newTag)}
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Notes */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">Notes</h3>
                      <Textarea
                        placeholder="Add your notes here..."
                        value={getMetadata(selectedArtifact.id).notes}
                        onChange={(e) => updateNotes(selectedArtifact.id, e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </div>
                </ScrollArea>

                {/* Chat Section */}
                <div className="border-t border-border flex flex-col" style={{ height: '250px' }}>
                  <div className="p-3 border-b border-border">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Ask about this artifact
                    </h3>
                  </div>
                  <ScrollArea className="flex-1 p-3">
                    <div className="space-y-3">
                      {(chatMessages[selectedArtifact.id] || []).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-2 text-sm ${
                              msg.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-border">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask a question..."
                        value={currentMessage}
                        onChange={(e) => setCurrentMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            sendChatMessage(selectedArtifact.id);
                          }
                        }}
                      />
                      <Button
                        size="icon"
                        onClick={() => sendChatMessage(selectedArtifact.id)}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // List View
              <>
                <div className="p-4 border-b border-border">
                  <p className="text-sm font-medium text-foreground mb-3">Filter by Type</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={selectedFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("all")}
                      className="flex-1 min-w-[80px]"
                    >
                      All ({artifacts.length})
                    </Button>
                    <Button
                      variant={selectedFilter === "definitions" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("definitions")}
                      className="flex-1 min-w-[80px]"
                    >
                      Definitions ({artifacts.filter(a => a.category === "definitions").length})
                    </Button>
                    <Button
                      variant={selectedFilter === "figures" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("figures")}
                      className="flex-1 min-w-[80px]"
                    >
                      Figures ({artifacts.filter(a => a.category === "figures").length})
                    </Button>
                    <Button
                      variant={selectedFilter === "methodologies" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter("methodologies")}
                      className="flex-1 min-w-[80px]"
                    >
                      Methodologies ({artifacts.filter(a => a.category === "methodologies").length})
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1">
                  <div className="p-4 space-y-4">
                    {filteredArtifacts.map((artifact) => (
                      <Card 
                        key={artifact.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          artifact.status === "rejected" 
                            ? "border-destructive" 
                            : artifact.source === "ai-generated"
                            ? "border-purple-500/50 border-2"
                            : ""
                        }`}
                        onClick={() => setSelectedArtifactId(artifact.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-muted-foreground">Card {artifact.cardNumber}</span>
                                <Badge variant={getTypeColor(artifact.type) as any} className="text-xs">
                                  {artifact.type}
                                </Badge>
                                {artifact.source === "ai-generated" && (
                                  <Badge variant="outline" className="text-xs bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400">
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    AI
                                  </Badge>
                                )}
                                {getMetadata(artifact.id).isFavorite && (
                                  <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                                )}
                              </div>
                              <CardTitle className="text-sm font-semibold">
                                KA: {artifact.title}
                              </CardTitle>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {artifact.content}
                          </p>
                          {getMetadata(artifact.id).tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {getMetadata(artifact.id).tags.slice(0, 3).map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {getMetadata(artifact.id).tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{getMetadata(artifact.id).tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-4 border-t border-border">
                  <Button className="w-full" size="lg">
                    Open Source & Extract KAs
                  </Button>
                </div>
              </>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
