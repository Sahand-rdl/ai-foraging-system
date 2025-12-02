import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Copy, X, Check } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ExtractedArtifact {
  id: number;
  cardNumber: number;
  title: string;
  content: string;
  type: "definition" | "figure" | "methodology" | "terminology";
  status: "pending" | "accepted" | "rejected";
}

export default function SourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [artifacts, setArtifacts] = useState<ExtractedArtifact[]>([
    {
      id: 1,
      cardNumber: 1,
      title: "Multi-Head Attention Definition",
      content: "Multi-head attention definition is snippet of the mechanism to constitute attention.",
      type: "definition",
      status: "pending"
    },
    {
      id: 2,
      cardNumber: 2,
      title: "Architecture Diagram",
      content: "The Transformer model architecture diagram showing encoder and decoder stacks with multi-head attention layers.",
      type: "figure",
      status: "pending"
    },
    {
      id: 3,
      cardNumber: 3,
      title: "Positional Encoding Method",
      content: "Positional encoding using sine and cosine functions to inject sequence order information.",
      type: "methodology",
      status: "pending"
    }
  ]);

  const handleAccept = (artifactId: number) => {
    setArtifacts(prev => 
      prev.map(a => a.id === artifactId ? { ...a, status: "accepted" as const } : a)
    );
  };

  const handleReject = (artifactId: number) => {
    setArtifacts(prev => 
      prev.map(a => a.id === artifactId ? { ...a, status: "rejected" as const } : a)
    );
  };

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
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 bg-muted/30 p-4 overflow-auto">
          <div className="max-w-4xl mx-auto bg-card rounded-lg shadow-lg overflow-hidden">
            <iframe
              src={source.pdfUrl}
              className="w-full h-[calc(100vh-8rem)]"
              title="PDF Viewer"
            />
          </div>
        </div>

        {/* AI Extraction Sidebar */}
        <div className="w-96 border-l border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">AI Extraction Agent</h2>
            <Button variant="ghost" size="icon" onClick={() => navigate("/sources")}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-4 border-b border-border">
            <p className="text-sm font-medium text-foreground mb-2">Detected KAs</p>
            <p className="text-xs text-muted-foreground">
              AI finished scanning. {artifacts.length} potential artifacts found.
            </p>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {artifacts.map((artifact) => (
                <Card 
                  key={artifact.id} 
                  className={`${
                    artifact.status === "accepted" 
                      ? "border-success" 
                      : artifact.status === "rejected" 
                      ? "border-destructive" 
                      : ""
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-muted-foreground">Card {artifact.cardNumber}</span>
                          <Badge variant={getTypeColor(artifact.type) as any} className="text-xs">
                            {artifact.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-semibold">
                          KA: {artifact.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {artifact.content}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReject(artifact.id)}
                        disabled={artifact.status === "rejected"}
                        className={artifact.status === "rejected" ? "text-destructive" : ""}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Reject
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleAccept(artifact.id)}
                        disabled={artifact.status === "accepted"}
                        className={artifact.status === "accepted" ? "bg-success hover:bg-success/90" : ""}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Accept
                      </Button>
                    </div>
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
        </div>
      </div>
    </div>
  );
}
