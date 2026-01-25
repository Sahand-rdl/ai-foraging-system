import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Copy } from "lucide-react";

interface SourceDetailHeaderProps {
  onBack: () => void;
  pdfUrl?: string;
}

export function SourceDetailHeader({ onBack, pdfUrl }: SourceDetailHeaderProps) {
  return (
    <header className="border-b border-border px-6 py-3 flex items-center justify-between bg-card">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Source Viewer</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {pdfUrl && (
          <Button variant="outline" size="sm" asChild>
            <a href={pdfUrl} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </a>
          </Button>
        )}
        <Button variant="outline" size="sm">
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
