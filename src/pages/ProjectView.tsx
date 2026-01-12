import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Filter, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data for project (in a real app, fetch based on id)
  const project = {
    id: id,
    name: "Machine Learning in Healthcare",
    description: "Exploring ML applications in diagnostics and treatment planning",
    status: "active",
    stats: {
      sources: 12,
      artifacts: 48,
      completed: 85
    },
    tags: ["machine learning", "healthcare", "diagnostics"]
  };

  // Mock data for knowledge sources
  const sources = [
    {
      id: 1,
      title: "Deep Learning for Medical Image Analysis",
      authors: "Smith et al.",
      year: 2023,
      status: "extracted",
      artifacts: 12,
      relevance: "High"
    },
    {
      id: 4,
      title: "Neural Network Architectures in Healthcare Systems",
      authors: "Chen, Park",
      year: 2024,
      status: "reviewing",
      artifacts: 5,
      relevance: "Medium"
    },
    {
      id: 5,
      title: "Ethics of AI in Clinical Practice",
      authors: "Jones, R.",
      year: 2023,
      status: "pending",
      artifacts: 0,
      relevance: "High"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "extracted":
        return <Badge variant="default" className="bg-green-600 hover:bg-green-700">Extracted</Badge>;
      case "reviewing":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">Reviewing</Badge>;
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
            <Badge variant="outline" className="text-sm">{project.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${id}/details`)}>
            <Info className="h-4 w-4 mr-2" />
            Project Details
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Stats Cards
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stats.sources}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Extracted Artifacts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stats.artifacts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stats.completed}%</div>
          </CardContent>
        </Card>
      </div> */}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Knowledge Sources</CardTitle>
              <CardDescription>All academic papers and documents linked to this project</CardDescription>
            </div>
            <div className="flex gap-2 w-1/3">
              <Input placeholder="Filter sources..." className="h-9" />
              <Button variant="outline" size="icon" className="h-9 w-9">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Title</TableHead>
                <TableHead>Authors</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Relevance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/sources/${source.id}`)}>
                  <TableCell className="font-medium">{source.title}</TableCell>
                  <TableCell>{source.authors}</TableCell>
                  <TableCell>{source.year}</TableCell>
                  <TableCell>{getStatusBadge(source.status)}</TableCell>
                  <TableCell>{source.relevance}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/sources/${source.id}`); }}>
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
