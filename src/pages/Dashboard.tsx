import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, FolderOpen, Database } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Overview of your research activity</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground mt-1">2 updated this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Sources</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground mt-1">8 pending review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Knowledge Artifacts</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">147</div>
            <p className="text-xs text-muted-foreground mt-1">32 tagged this week</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your most recently active research projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Machine Learning in Healthcare", sources: 12, artifacts: 48 },
              { name: "Quantum Computing Applications", sources: 8, artifacts: 35 },
              { name: "Climate Change Mitigation", sources: 4, artifacts: 64 },
            ].map((project, i) => (
              <div key={i} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
                <div>
                  <div className="font-medium text-foreground">{project.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {project.sources} sources • {project.artifacts} artifacts
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates across your projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { action: "Added knowledge source", project: "Machine Learning in Healthcare", time: "2 hours ago" },
              { action: "Tagged 5 artifacts", project: "Quantum Computing Applications", time: "5 hours ago" },
              { action: "Created new project", project: "Climate Change Mitigation", time: "1 day ago" },
              { action: "Extracted 12 artifacts", project: "Machine Learning in Healthcare", time: "2 days ago" },
            ].map((activity, i) => (
              <div key={i} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="h-2 w-2 bg-primary rounded-full mt-2" />
                <div className="flex-1">
                  <div className="text-sm text-foreground">{activity.action}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {activity.project} • {activity.time}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
