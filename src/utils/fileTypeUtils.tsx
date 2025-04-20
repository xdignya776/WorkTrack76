
import React from "react";
import { File, Image, FileSpreadsheet, FileText } from "lucide-react";

export const SUPPORTED_FILE_TYPES = {
  "image/jpeg": { icon: Image, color: "text-blue-500" },
  "image/png": { icon: Image, color: "text-blue-500" },
  "image/gif": { icon: Image, color: "text-blue-500" },
  "image/webp": { icon: Image, color: "text-blue-500" },
  "image/svg+xml": { icon: Image, color: "text-blue-500" },
  "application/pdf": { icon: FileText, color: "text-red-500" },
  "application/msword": { icon: FileText, color: "text-blue-500" },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": { icon: FileText, color: "text-blue-500" },
  "application/vnd.ms-excel": { icon: FileSpreadsheet, color: "text-green-500" },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { icon: FileSpreadsheet, color: "text-green-500" },
  "text/plain": { icon: FileText, color: "text-gray-500" },
  "text/csv": { icon: FileSpreadsheet, color: "text-green-500" },
  "application/json": { icon: FileText, color: "text-yellow-500" },
  "default": { icon: File, color: "text-muted-foreground" }
};

export const getFileIcon = (file: File) => {
  const fileConfig = SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES] || 
                    SUPPORTED_FILE_TYPES.default;
  
  const IconComponent = fileConfig.icon;
  return <IconComponent className={`h-6 w-6 ${fileConfig.color}`} />;
};
