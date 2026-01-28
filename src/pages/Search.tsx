import { useState } from "react";
import { searchApi, SearchResultItem } from "@/services/api/search";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search as SearchIcon, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"keyword" | "semantic">("keyword");
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setHasSearched(true);
    setResults([]); // Clear previous results immediately
    try {
      const response = await searchApi.search({ query, search_type: searchType });
      setResults(response.results);
    } catch (error) {
      console.error(error);
      toast.error("Search failed. Please ensure services are running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Search Repository</h1>
        <p className="text-muted-foreground">
          Find relevant papers and extracted knowledge.
        </p>
      </div>

      <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-6">
        <div className="w-full p-8 rounded-2xl border bg-card/50 shadow-sm space-y-6">
          <div className="flex w-full items-center gap-3">
            <Input 
              className="h-14 text-lg bg-secondary/30 border-secondary-foreground/10 focus-visible:ring-primary/20" 
              placeholder="Enter your search query..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              autoFocus
            />
            <Button 
              size="lg" 
              className="h-14 w-14 rounded-lg bg-blue-500 hover:bg-blue-600 shadow-lg shadow-blue-500/20 shrink-0 p-0" 
              onClick={handleSearch} 
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : <SearchIcon className="h-6 w-6 text-white" />}
            </Button>
          </div>
          
          <div className="flex justify-center w-full">
            <Tabs value={searchType} onValueChange={(v) => setSearchType(v as "keyword" | "semantic")} className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2 h-11 bg-secondary/30 p-1">
                <TabsTrigger value="keyword" className="data-[state=active]:bg-background/50 data-[state=active]:shadow-sm transition-all duration-200">Keyword Search</TabsTrigger>
                <TabsTrigger value="semantic" className="data-[state=active]:bg-background/50 data-[state=active]:shadow-sm transition-all duration-200">Semantic Search</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 rounded-xl border bg-muted/20 animate-pulse" />
                ))}
            </div>
        )}

        {!isLoading && hasSearched && results.length === 0 && (
           <div className="text-center py-10 text-muted-foreground">
             <SearchIcon className="h-10 w-10 mx-auto mb-2 opacity-20" />
             No results found for "{query}".
           </div>
        )}

        {!isLoading && results.map((result, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center gap-3 space-y-0">
                <div className="h-10 w-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                   <CardTitle className="text-base font-medium text-blue-600 truncate" title={result.filename}>
                        {result.filename}
                   </CardTitle>
                </div>
                <Badge variant={result.type.includes("Semantic") ? "secondary" : "outline"} className="shrink-0">
                    {result.type}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-foreground/80 font-mono bg-muted/50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                  {result.snippet}
                </div>
                {(result.score !== undefined && result.score !== null) && (
                    <div className="mt-2 text-xs text-muted-foreground text-right">
                        Score: {result.score.toFixed(4)}
                    </div>
                )}
              </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
