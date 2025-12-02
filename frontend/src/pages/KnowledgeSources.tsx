import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Upload, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function KnowledgeSources() {
  const navigate = useNavigate();
  const sources = [
    {
      id: 1,
      title: "Deep Learning for Medical Image Analysis",
      authors: "Smith et al.",
      year: 2023,
      status: "extracted",
      artifacts: 12,
      project: "Machine Learning in Healthcare",
      relevanceScore: 0.92,
    },
    {
      id: 2,
      title: "Quantum Algorithms for Cryptographic Applications",
      authors: "Johnson, Lee",
      year: 2024,
      status: "pending",
      artifacts: 0,
      project: "Quantum Computing Applications",
      relevanceScore: 0.88,
    },
    {
      id: 3,
      title: "Carbon Capture Technologies: A Comprehensive Review",
      authors: "Williams et al.",
      year: 2023,
      status: "extracted",
      artifacts: 8,
      project: "Climate Change Mitigation",
      relevanceScore: 0.95,
    },
    {
      id: 4,
      title: "Neural Network Architectures in Healthcare Systems",
      authors: "Chen, Park",
      year: 2024,
      status: "reviewing",
      artifacts: 5,
      project: "Machine Learning in Healthcare",
      relevanceScore: 0.87,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "extracted":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "reviewing":
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "extracted":
        return "default";
      case "pending":
        return "secondary";
      case "reviewing":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Knowledge Sources</h2>
          <p className="text-muted-foreground mt-1">Manage your research papers and documents</p>
        </div>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Source
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input placeholder="Search by title, author, or project..." className="flex-1" />
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {sources.map((source) => (
          <Card 
            key={source.id} 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/sources/${source.id}`)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(source.status)}
                    <CardTitle className="text-lg">{source.title}</CardTitle>
                  </div>
                  <CardDescription>
                    {source.authors} • {source.year}
                  </CardDescription>
                </div>
                <Badge variant={getStatusColor(source.status) as any}>
                  {source.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Project: <span className="text-foreground">{source.project}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Artifacts extracted: <span className="text-foreground">{source.artifacts}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">
                    Relevance Score
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {(source.relevanceScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
