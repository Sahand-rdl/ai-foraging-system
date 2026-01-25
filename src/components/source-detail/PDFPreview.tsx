import { useState, useRef, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ZoomIn, ZoomOut, Search, ChevronUp, ChevronDown, X, ArrowLeft } from "lucide-react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewProps {
  pdfUrl: string;
  onBack?: () => void;
}

interface SearchMatch {
  element: HTMLElement;
  pageNumber: number;
}

export function PDFPreview({ pdfUrl, onBack }: PDFPreviewProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1.0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [matches, setMatches] = useState<SearchMatch[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.2, 3.0));
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.2, 0.5));

  // Search and highlight text in the PDF
  const performSearch = useCallback(() => {
    if (!containerRef.current || !searchQuery.trim()) {
      // Clear all highlights
      containerRef.current?.querySelectorAll(".pdf-search-highlight").forEach((el) => {
        const parent = el.parentNode;
        if (parent) {
          parent.replaceChild(document.createTextNode(el.textContent || ""), el);
          parent.normalize();
        }
      });
      setMatches([]);
      setCurrentMatchIndex(0);
      return;
    }

    // First, clear previous highlights
    containerRef.current.querySelectorAll(".pdf-search-highlight").forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });

    const query = searchQuery.toLowerCase();
    const newMatches: SearchMatch[] = [];

    // Find all text layer spans
    const pages = containerRef.current.querySelectorAll(".react-pdf__Page");
    pages.forEach((page, pageIndex) => {
      const textLayer = page.querySelector(".react-pdf__Page__textContent");
      if (!textLayer) return;

      const walker = document.createTreeWalker(textLayer, NodeFilter.SHOW_TEXT, null);
      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        textNodes.push(node as Text);
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent?.toLowerCase() || "";
        const originalText = textNode.textContent || "";
        let startIndex = 0;
        let index;

        const fragments: (string | HTMLElement)[] = [];
        let lastEnd = 0;

        while ((index = text.indexOf(query, startIndex)) !== -1) {
          // Add text before match
          if (index > lastEnd) {
            fragments.push(originalText.slice(lastEnd, index));
          }

          // Create highlight span
          const highlight = document.createElement("mark");
          highlight.className = "pdf-search-highlight";
          highlight.style.backgroundColor = "#fbbf24";
          highlight.style.color = "black";
          highlight.style.borderRadius = "2px";
          highlight.textContent = originalText.slice(index, index + query.length);
          fragments.push(highlight);
          newMatches.push({ element: highlight, pageNumber: pageIndex + 1 });

          lastEnd = index + query.length;
          startIndex = index + 1;
        }

        // Add remaining text
        if (lastEnd < originalText.length) {
          fragments.push(originalText.slice(lastEnd));
        }

        if (fragments.length > 1) {
          const parent = textNode.parentNode;
          if (parent) {
            fragments.forEach((fragment) => {
              if (typeof fragment === "string") {
                parent.insertBefore(document.createTextNode(fragment), textNode);
              } else {
                parent.insertBefore(fragment, textNode);
              }
            });
            parent.removeChild(textNode);
          }
        }
      });
    });

    setMatches(newMatches);
    setCurrentMatchIndex(newMatches.length > 0 ? 0 : -1);

    // Scroll to first match
    if (newMatches.length > 0) {
      newMatches[0].element.scrollIntoView({ behavior: "smooth", block: "center" });
      newMatches[0].element.style.backgroundColor = "#f97316"; // Orange for current
    }
  }, [searchQuery]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [performSearch]);

  // Navigate between matches
  const goToMatch = (index: number) => {
    if (matches.length === 0) return;

    // Reset previous current highlight
    if (matches[currentMatchIndex]) {
      matches[currentMatchIndex].element.style.backgroundColor = "#fbbf24";
    }

    const newIndex = ((index % matches.length) + matches.length) % matches.length;
    setCurrentMatchIndex(newIndex);

    // Highlight current match differently
    matches[newIndex].element.style.backgroundColor = "#f97316";
    matches[newIndex].element.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const goToPrevMatch = () => goToMatch(currentMatchIndex - 1);
  const goToNextMatch = () => goToMatch(currentMatchIndex + 1);

  const clearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

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
      <div className="flex items-center justify-between gap-2 p-2 border-b border-border bg-card">
        {/* Left: Back button, Page count and zoom */}
        <div className="flex items-center gap-2">
          {onBack && (
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <span className="text-sm text-muted-foreground">
            {numPages} {numPages === 1 ? "page" : "pages"}
          </span>
          <div className="w-px h-6 bg-border mx-1" />
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

        {/* Right: Search bar */}
        <div className="flex items-center gap-1">

              {/* Navigation buttons - always visible when searching */}
          {searchQuery && (
            <>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToPrevMatch} 
                disabled={matches.length === 0}
                className="h-8 w-8"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={goToNextMatch} 
                disabled={matches.length === 0}
                className="h-8 w-8"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </>
          )}
          <div className="relative flex items-center">
            <Search className="absolute left-2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search PDF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-20 h-8 w-56"
            />
            {/* Match count inside input */}
            <div className="absolute right-8 flex items-center gap-1 pointer-events-none">
              {searchQuery && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {matches.length > 0 
                    ? `${currentMatchIndex + 1}/${matches.length}` 
                    : "0/0"}
                </span>
              )}
            </div>
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearSearch}
                className="absolute right-0 h-8 w-8 hover:bg-transparent"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
      
        </div>
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
