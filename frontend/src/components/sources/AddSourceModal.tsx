import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Link, Loader2, FileText, X } from "lucide-react";
import { downloadPaper, uploadPaper } from "@/services/api";
import { useToast } from "@/components/ui/use-toast";
import { UploadProgress, UPLOAD_STEPS } from "./UploadProgress";

interface AddSourceModalProps {
  projectId: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddSourceModal({ projectId, trigger, onSuccess, open: controlledOpen, onOpenChange: setControlledOpen }: AddSourceModalProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const { toast } = useToast();
  
  // Use controlled or uncontrolled state
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;
  const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen;

  const [activeTab, setActiveTab] = useState<"url" | "upload">("upload");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadCompletedRef = useRef(false); // Ref to track API completion
  const animationTimeoutRef = useRef<NodeJS.Timeout[]>([]); // Ref to store animation timeouts

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsSubmitting(true);
    try {
      await downloadPaper(projectId, { url });
      toast({
        title: "Success",
        description: "Paper downloaded and added to project.",
      });
      setUrl("");
      if (setOpen) setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download paper. Please check the URL.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetUploadState = () => {
    setFile(null);
    setShowProgress(false);
    setUploadStep(0);
    setIsSubmitting(false);
    uploadCompletedRef.current = false;
    animationTimeoutRef.current.forEach(clearTimeout);
    animationTimeoutRef.current = [];
  };

  useEffect(() => {
    // This useEffect is solely responsible for driving the animation sequence
    // It should only run when showProgress is explicitly true and an upload is initiating
    if (!showProgress) {
        // If showProgress is false, it means either animation hasn't started
        // or has finished/been reset. Nothing to do here.
        return;
    }

    uploadCompletedRef.current = false;
    let currentAnimationStep = 0;
    let totalDelay = 0;
    
    // Clear any previous timeouts/intervals when starting a new animation
    animationTimeoutRef.current.forEach(clearTimeout);
    animationTimeoutRef.current.forEach(clearInterval);
    animationTimeoutRef.current = [];

    const runStep = (stepIndex: number) => {
      if (stepIndex >= UPLOAD_STEPS.length) {
        // All animation steps played, now wait for actual upload to complete
        const finalCheckInterval = setInterval(() => {
          if (uploadCompletedRef.current) {
            clearInterval(finalCheckInterval);
            setUploadStep(UPLOAD_STEPS.length + 1); // Mark all done
            // Show success and close modal
            toast({
              title: "Success",
              description: "Paper uploaded and processed successfully.",
            });
            setTimeout(() => {
              if (setOpen) setOpen(false);
              resetUploadState(); // Reset state after dialog closes
            }, 800); // A small delay to let the user see the final checkmark
          }
        }, 500);
        animationTimeoutRef.current.push(finalCheckInterval); // Store interval ID for cleanup
        return;
      }

      const step = UPLOAD_STEPS[stepIndex];
      const timeoutId = setTimeout(() => {
        if (uploadCompletedRef.current) {
          // If API already finished, jump to final step
          setUploadStep(UPLOAD_STEPS.length + 1);
          // Show success and close modal immediately
          toast({
            title: "Success",
            description: "Paper uploaded and processed successfully.",
          });
          setTimeout(() => {
            if (setOpen) setOpen(false);
            resetUploadState(); // Reset state after dialog closes
          }, 800);
        } else {
          setUploadStep(step.id);
          runStep(stepIndex + 1);
        }
      }, step.duration);
      animationTimeoutRef.current.push(timeoutId); // Store timeout ID for cleanup
    };

    // Start the animation sequence
    setUploadStep(UPLOAD_STEPS[0].id); // Start with the first step
    runStep(0); // Start the step sequence

    return () => {
      // Cleanup on unmount or if showProgress changes
      animationTimeoutRef.current.forEach(clearTimeout);
      animationTimeoutRef.current.forEach(clearInterval); // Clear any intervals too
      animationTimeoutRef.current = [];
    };
  }, [showProgress, projectId, onSuccess, setOpen, toast]); // Removed 'file' from dependencies


  const handleFileUpload = async () => {
    if (!file) return;

    setIsSubmitting(true);
    setShowProgress(true); // This will trigger the useEffect for animation
    
    // Asynchronously call the API, don't await here to let animation run
    uploadPaper(projectId, file, onSuccess)
      .then(() => {
        uploadCompletedRef.current = true; // Mark API call as complete
      })
      .catch((error) => {
        console.error(error);
        toast({
          variant: "destructive",
          title: "Upload Error",
          description: error instanceof Error ? error.message : "An unknown error occurred.",
        });
        // On error, immediately reset state
        if (setOpen) setOpen(false);
        resetUploadState();
      });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // No need to call resetUploadState here directly.
      // The logic within useEffect handles animation state based on showProgress.
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      setOpen(val);
      if (!val) resetUploadState(); // Reset state when dialog closes
    }}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Knowledge Source</DialogTitle>
          <DialogDescription>
            Add a new paper to your project from a URL or by uploading a PDF.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "url" | "upload")} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">From URL</TabsTrigger>
            <TabsTrigger value="upload">Upload File</TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 py-4">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">Paper URL (ArXiv, PDF link, etc.)</Label>
                <div className="relative">
                  <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="url"
                    placeholder="https://arxiv.org/abs/..."
                    className="pl-9"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={!url || isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Source
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 py-4 w-[calc(500px-3rem)] overflow-hidden"> {/* Precise width for TabsContent */}
            {showProgress ? (
                <div className="py-4">
                    <UploadProgress currentStep={uploadStep} fileName={file?.name || "Document"} />
                </div>
            ) : (
                <>
                    <div 
                    className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-accent/50 transition-colors cursor-pointer w-full overflow-x-hidden min-w-0" // w-full and explicit overflow-x-hidden
                    onClick={() => fileInputRef.current?.click()}
                    >
                    <input 
                        type="file" 
                        className="hidden" 
                        ref={fileInputRef} 
                        accept=".pdf" 
                        onChange={handleFileChange}
                    />
                    {file ? (
                        <div className="flex flex-col items-center gap-2 min-w-0 max-w-full overflow-hidden">
                        <FileText className="h-10 w-10 text-primary" />
                        <p className="font-medium text-sm w-full overflow-hidden whitespace-nowrap text-ellipsis" title={file.name}>{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 h-8 text-destructive hover:text-destructive"
                            onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                            }}
                        >
                            <X className="mr-2 h-3 w-3" /> Remove
                        </Button>
                        </div>
                    ) : (
                        <>
                        <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">Click to select a PDF file</p>
                        <p className="text-xs text-muted-foreground mt-1">Accepts PDF files up to 50MB</p>
                        </>
                    )}
                    </div>
        
                    <div className="flex justify-end mt-4">
                    <Button onClick={handleFileUpload} disabled={!file || isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload PDF
                    </Button>
                    </div>
                </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
