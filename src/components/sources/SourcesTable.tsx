import { FileText, Link as LinkIcon, MoreHorizontal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { KnowledgeSource, Trustworthiness } from "@/types/source";

interface SourcesTableProps {
  sources: KnowledgeSource[];
  selectedSourceId: number | null;
  onSelectSource: (id: number | null) => void;
  onOpenSource?: (id: number) => void;
  onDeleteSource?: (id: number) => void;
  getTitle?: (source: KnowledgeSource) => string;
  showRelevance?: boolean; // New prop for conditional rendering
}

function getTrustworthinessColor(level: Trustworthiness) {
  switch (level) {
    case "High":
      return "text-emerald-500";
    case "Medium":
      return "text-yellow-500";
    case "Low":
      return "text-red-500";
    default:
      return "text-muted-foreground";
  }
}

function getSourceType(source: KnowledgeSource): "PDF" | "Link" {
  const url = source.metadata.url;
  if (!url) return "PDF";
  return url.includes("arxiv") || url.startsWith("http") ? "Link" : "PDF";
}

export function SourcesTable({
  sources,
  selectedSourceId,
  onSelectSource,
  onOpenSource,
  onDeleteSource,
  getTitle,
  showRelevance = true, // Default to true (for ProjectView)
}: SourcesTableProps) {
  const defaultGetTitle = (source: KnowledgeSource) => {
    return (source.metadata as { title?: string }).title || `Source #${source.id}`;
  };

  const titleFn = getTitle || defaultGetTitle;

  return (
    <div className="bg-card">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow className="hover:bg-transparent"><TableHead className="w-[50px]">Type</TableHead><TableHead>Title</TableHead><TableHead className="w-[120px]">Trustworthiness</TableHead><TableHead className={showRelevance ? "w-[200px]" : "w-[240px]"}>Authors</TableHead>{showRelevance && <TableHead className="w-[100px] text-right">Relevance</TableHead>}<TableHead className="w-[60px]"></TableHead></TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow
              key={source.id}
              className={`cursor-pointer align-top h-16 border-b ${
                selectedSourceId === source.id ? "bg-accent/50" : ""
              }`}
              onClick={() =>
                onSelectSource(source.id === selectedSourceId ? null : source.id)
              }
              onDoubleClick={() => onOpenSource?.(source.id)}
            >
              <TableCell className="w-[50px]">
                {getSourceType(source) === "PDF" ? (
                  <FileText className="h-4 w-4 text-red-400" />
                ) : (
                  <LinkIcon className="h-4 w-4 text-blue-400" />
                )}
              </TableCell>
              <TableCell className="font-medium overflow-hidden text-ellipsis whitespace-nowrap">
                <div className="truncate" title={titleFn(source)}>
                  {titleFn(source)}
                </div>
              </TableCell>
              <TableCell className="w-[120px]">
                <span className={`text-sm font-semibold ${getTrustworthinessColor(source.trustworthiness)}`}>
                  {source.trustworthiness}
                </span>
              </TableCell>
              <TableCell className={showRelevance ? "w-[200px]" : "w-[240px]"}>
                <span className="text-sm text-muted-foreground truncate block">
                  {Array.isArray(source.metadata.authors)
                    ? source.metadata.authors.join(", ")
                    : source.metadata.authors || "Unknown"}
                </span>
              </TableCell>
              {showRelevance && (
                <TableCell className="w-[100px] text-right">
                  <span className="text-sm text-muted-foreground">
                    {source.metadata.relevance !== undefined && source.metadata.relevance !== null
                      ? Math.round(source.metadata.relevance) + '%'
                      : "N/A"}
                  </span>
                </TableCell>
              )}
              <TableCell className="w-[60px]">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSource?.(source.id);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}