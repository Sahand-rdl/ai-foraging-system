import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, MoreVertical, FileText, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Projects() {
  const projects = [
    {
      name: "Machine Learning in Healthcare",
      description: "Exploring ML applications in diagnostics and treatment planning",
      sources: 12,
      artifacts: 48,
      tags: ["machine learning", "healthcare", "diagnostics"],
      status: "active",
    },
    {
      name: "Quantum Computing Applications",
      description: "Investigating practical uses of quantum computing in cryptography",
      sources: 8,
      artifacts: 35,
      tags: ["quantum computing", "cryptography"],
      status: "active",
    },
    {
      name: "Climate Change Mitigation",
      description: "Research on renewable energy solutions and carbon capture",
      sources: 4,
      artifacts: 64,
      tags: ["climate", "renewable energy", "sustainability"],
      status: "active",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Projects</h2>
          <p className="text-muted-foreground mt-1">Manage your research projects</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {project.status}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>{project.sources} sources</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Database className="h-4 w-4" />
                  <span>{project.artifacts} artifacts</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, j) => (
                  <Badge key={j} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
