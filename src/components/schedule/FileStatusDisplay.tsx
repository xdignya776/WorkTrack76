import React from 'react';
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkSchedule } from "@/utils/insightGenerator";

type FileStatus = "idle" | "ready" | "uploading" | "processing" | "success" | "error";

interface FileStatusDisplayProps {
  fileStatus: FileStatus;
  selectedFile: File | null;
  uploadProgress: number;
  processedShifts: WorkSchedule[];
  resetUpload: () => void;
  simulateUpload: () => void;
  getFileIcon: (file: File) => JSX.Element;
}

const FileStatusDisplay: React.FC<FileStatusDisplayProps> = ({
  fileStatus,
  selectedFile,
  uploadProgress,
  processedShifts,
  resetUpload,
  simulateUpload,
  getFileIcon
}) => {
  if (!selectedFile) return null;

  return (
    <div className="border rounded-xl p-6 animate-scale-in">
      <div className="flex items-center mb-4">
        <div className="mr-3 p-2 rounded-md bg-accent">
          {getFileIcon(selectedFile)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{selectedFile.name}</h4>
          <p className="text-xs text-muted-foreground">
            {(selectedFile.size / 1024).toFixed(2)} KB
          </p>
        </div>
        <button 
          onClick={resetUpload}
          className="p-1 hover:bg-accent rounded-full transition-colors"
          aria-label="Remove file"
          disabled={fileStatus === "uploading" || fileStatus === "processing"}
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
      
      {fileStatus === "ready" && (
        <Button 
          className="w-full" 
          onClick={simulateUpload}
        >
          Upload Schedule
        </Button>
      )}
      
      {fileStatus === "uploading" && (
        <div className="space-y-2">
          <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
        </div>
      )}
      
      {fileStatus === "processing" && (
        <div className="flex items-center text-primary font-medium">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {selectedFile.type.startsWith('image/') 
            ? "Processing your image with OCR..." 
            : "Processing your schedule..."}
        </div>
      )}
      
      {fileStatus === "success" && (
        <div className="space-y-4">
          <div className="flex items-center text-green-500 font-medium">
            <Check className="mr-1 h-4 w-4" />
            Upload complete! Your schedule has been processed.
          </div>
          
          {processedShifts.length > 0 && (
            <div className="mt-4 border rounded-lg p-4 bg-accent/30">
              <h4 className="font-medium mb-2">Processed Shifts:</h4>
              <div className="space-y-2">
                {processedShifts.map((shift) => (
                  <div key={shift.id} className="p-2 bg-background rounded-md text-sm flex justify-between">
                    <div>
                      <span className="font-medium">{shift.title}</span>
                      <span className="text-xs text-muted-foreground block">
                        {new Date(shift.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="block">{shift.startTime} - {shift.endTime}</span>
                      <span className="text-xs text-green-500">{shift.synced ? "Synced" : "Not synced"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button 
            className="w-full" 
            variant="outline" 
            size="sm"
            onClick={resetUpload}
          >
            Upload Another
          </Button>
        </div>
      )}
      
      {fileStatus === "error" && (
        <div className="flex items-center text-red-500 font-medium">
          <X className="mr-1 h-4 w-4" />
          Upload failed. Please try again.
          
          <Button 
            className="ml-auto" 
            variant="outline" 
            size="sm"
            onClick={resetUpload}
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileStatusDisplay;
