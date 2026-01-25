import { FileText, Link as LinkIcon } from "lucide-react";
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
  getTitle?: (source: KnowledgeSource) => string;
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
  getTitle,
}: SourcesTableProps) {
  const defaultGetTitle = (source: KnowledgeSource) => {
    // Extract title from metadata or use a default
    return (source.metadata as { title?: string }).title || `Source #${source.id}`;
  };

  const titleFn = getTitle || defaultGetTitle;

  return (
    <div className="bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[50px]">Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="w-[120px]">Trustworthiness</TableHead>
            <TableHead className="w-[240px]">Authors</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sources.map((source) => (
            <TableRow
              key={source.id}
              className={`cursor-pointer ${
                selectedSourceId === source.id ? "bg-accent/50" : ""
              }`}
              onClick={() =>
                onSelectSource(source.id === selectedSourceId ? null : source.id)
              }
              onDoubleClick={() => onOpenSource?.(source.id)}
            >
              <TableCell>
                {getSourceType(source) === "PDF" ? (
                  <FileText className="h-4 w-4 text-red-400" />
                ) : (
                  <LinkIcon className="h-4 w-4 text-blue-400" />
                )}
              </TableCell>
              <TableCell className="font-medium">{titleFn(source)}</TableCell>
              <TableCell>
                <span
                  className={`text-sm font-semibold ${getTrustworthinessColor(
                    source.trustworthiness
                  )}`}
                >
                  {source.trustworthiness}
                </span>
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground truncate block max-w-[200px]">
                  {source.metadata.authors || "Unknown"}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
