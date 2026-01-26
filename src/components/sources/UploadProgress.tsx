import { Check, Loader2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";

export interface UploadStep {
  id: number;
  label: string;
  subtext?: string;
  duration?: number; // Estimated duration in ms for this step
}

export const UPLOAD_STEPS: UploadStep[] = [
  { id: 1, label: "Parsing document", subtext: "Parsing complete.", duration: 4000 },
  { id: 2, label: "Running Metadata Extraction", subtext: "Metadata Extraction complete.", duration: 3000 },
  { id: 3, label: "Running Trust Checker", subtext: "Trust Checker complete.", duration: 2000 },
  { id: 4, label: "Running Entity Extractor", subtext: "Entities extracted.", duration: 5000 },
  { id: 5, label: "Generating tags (TF-IDF)", subtext: "Tag generation complete.", duration: 4000 },
  { id: 6, label: "Running Relevancy Checker", subtext: "Relevancy Checker complete.", duration: 3000 },
  { id: 7, label: "Ingesting document for semantic search", subtext: "Ingestion complete.", duration: 8000 },
];

interface UploadProgressProps {
  currentStep: number;
  fileName: string;
}

export function UploadProgress({ currentStep, fileName }: UploadProgressProps) {
  // We can add a localized progress bar for the current step if we want extra flair,
  // but the user just requested visualizing the steps.
  
  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border">
        <FileText className="h-8 w-8 text-primary" />
        <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{fileName}</p>
            <p className="text-xs text-muted-foreground">Processing upload...</p>
        </div>
      </div>

      <div className="space-y-4">
        {UPLOAD_STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isFuture = currentStep < step.id;

          return (
            <div 
                key={step.id} 
                className={cn(
                    "flex flex-col gap-1 transition-all duration-500",
                    isFuture && "opacity-40"
                )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border text-xs font-medium transition-colors",
                  isCompleted ? "bg-primary text-primary-foreground border-primary" : 
                  isCurrent ? "border-primary text-primary" : "border-muted-foreground text-muted-foreground"
                )}>
                  {isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : isCurrent ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                <div className="flex-1">
                    <p className={cn(
                        "text-sm font-medium leading-none",
                        isCurrent && "text-primary"
                    )}>
                        {step.label}
                    </p>
                </div>
              </div>
              
              {/* Always reserve space for subtext to prevent jumping */}
               <div className={cn(
                   "ml-9 text-xs text-muted-foreground transition-all duration-300",
                   (isCompleted || isCurrent) ? "opacity-100" : "opacity-40"
               )}>
                   {isCompleted ? step.subtext : isCurrent ? "Processing..." : "Waiting..."}
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
