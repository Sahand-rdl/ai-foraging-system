import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function Tags() {
  const tags = [
    { name: "machine learning", count: 34, color: "default" },
    { name: "healthcare", count: 28, color: "default" },
    { name: "quantum computing", count: 22, color: "default" },
    { name: "cryptography", count: 18, color: "secondary" },
    { name: "climate", count: 24, color: "default" },
    { name: "renewable energy", count: 16, color: "secondary" },
    { name: "diagnostics", count: 15, color: "secondary" },
    { name: "CNN", count: 12, color: "outline" },
    { name: "carbon capture", count: 14, color: "secondary" },
    { name: "transfer learning", count: 10, color: "outline" },
    { name: "post-quantum", count: 8, color: "outline" },
    { name: "batteries", count: 9, color: "outline" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Tags</h2>
        <p className="text-muted-foreground mt-1">Explore and manage your knowledge artifact tags</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Search Tags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search tags..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tags.map((tag, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <Badge variant={tag.color as any} className="text-sm px-3 py-1">
                  {tag.name}
                </Badge>
                <span className="text-2xl font-bold text-foreground">{tag.count}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {tag.count} artifact{tag.count !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
