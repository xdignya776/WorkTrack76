
import React from 'react';
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileDropzoneProps {
  dragActive: boolean;
  handleDrag: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({
  dragActive,
  handleDrag,
  handleDrop,
  fileInputRef,
  handleChange
}) => {
  return (
    <div 
      className={cn(
        "relative border-2 border-dashed rounded-xl px-6 py-10 transition-all duration-300",
        dragActive 
          ? "border-primary bg-primary/5" 
          : "border-border hover:border-primary/50 hover:bg-accent/50"
      )}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept="image/*,.csv,.xlsx,.txt,.pdf,.doc,.docx"
      />
      
      <div className="flex flex-col items-center justify-center text-center">
        <div className="mb-4 p-4 rounded-full bg-primary/10">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-1">Upload your schedule</h3>
        <p className="text-muted-foreground mb-4 max-w-xs">
          Drag and drop your file here, or click to browse
        </p>
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="relative overflow-hidden transition-all duration-300 button-hover-effect"
        >
          Browse Files
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Supported formats: Images, PDF, Word, Excel, CSV, TXT and more
        </p>
      </div>
    </div>
  );
};

export default FileDropzone;
