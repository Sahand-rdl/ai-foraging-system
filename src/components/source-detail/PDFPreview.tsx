import { useState, useRef, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  pdfUrl: string;
}

export function PDFPreview({ pdfUrl }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const containerRef = useRef<HTMLDivElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

  // Track container width for responsive full-width rendering
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        // Subtract padding (32px = 16px * 2)
        setContainerWidth(containerRef.current.clientWidth - 32);
      }
    };

    updateWidth();
    const resizeObserver = new ResizeObserver(updateWidth);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  if (!pdfUrl) {
    return (
      <div className="h-full bg-muted/30 overflow-hidden flex items-center justify-center">
        <div className="text-muted-foreground p-4">No PDF URL available for this source</div>
      </div>
    );
  }

  // Calculate effective width based on zoom
  const effectiveWidth = containerWidth * zoom;

  return (
    <div className="h-full flex flex-col bg-muted/30">
      {/* Controls */}
      <div className="flex items-center justify-center gap-2 p-2 border-b border-border bg-card">
        <span className="text-sm text-muted-foreground">
          {numPages} {numPages === 1 ? "page" : "pages"}
        </span>
        <div className="w-px h-6 bg-border mx-2" />
        <Button variant="outline" size="icon" onClick={zoomOut} disabled={zoom <= 0.5}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <Button variant="outline" size="icon" onClick={zoomIn} disabled={zoom >= 3.0}>
          <ZoomIn className="h-4 w-4" />
        </Button>
      </div>

      {/* PDF Document - Continuous scrolling */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4">
        <Document
          file={pdfUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<div className="text-muted-foreground text-center">Loading PDF...</div>}
          error={<div className="text-destructive text-center">Failed to load PDF</div>}
          className="flex flex-col items-center gap-4"
        >
          {containerWidth > 0 && Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={effectiveWidth}
              renderTextLayer={true}
              renderAnnotationLayer={true}
              className="shadow-md"
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
