interface PDFPreviewProps {
  pdfUrl: string;
}

export function PDFPreview({ pdfUrl }: PDFPreviewProps) {
  return (
    <div className="h-full bg-muted/30 overflow-hidden flex items-center justify-center">
      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          className="w-full h-full"
          title="PDF Viewer"
        />
      ) : (
        <div className="text-muted-foreground p-4">No PDF URL available for this source</div>
      )}
    </div>
  );
}
