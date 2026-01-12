import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function ProjectInfo() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data - in a real app this would come from an API based on id
  const project = {
    id: id,
    name: "Machine Learning in Healthcare",
    status: "active",
    mlProblemStatement: "To develop a robust deep learning model capable of early detection of diabetic retinopathy from retinal fundus images, aiming to reduce blindness in low-resource settings by achieving a sensitivity of 95% and specificity of 90% comparable to clinical experts.",
    researchers: [
      { name: "Dr. Sarah Chen", role: "Principal Investigator", avatar: "SC" },
      { name: "Prof. Michael Ross", role: "ML Architect", avatar: "MR" },
      { name: "Jessica Wu", role: "Data Scientist", avatar: "JW" },
      { name: "David Okonjo", role: "Clinical Partner", avatar: "DO" }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(`/projects/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Project Details</h1>
          <p className="text-muted-foreground mt-1">{project.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>ML Problem Statement</CardTitle>
            <CardDescription>The core machine learning challenge being addressed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-muted/30 rounded-lg border border-border">
              <p className="text-lg leading-relaxed text-foreground">
                {project.mlProblemStatement}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Research Team</CardTitle>
            <CardDescription>Collaborators working on this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {project.researchers.map((researcher, i) => (
                <div key={i} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>{researcher.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{researcher.name}</div>
                    <div className="text-sm text-muted-foreground">{researcher.role}</div>
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
      </div>
    </div>
  );
}
