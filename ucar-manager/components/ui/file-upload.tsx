"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, File, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface FileUploadProps {
  acceptedTypes?: string[];
  maxSizeMB?: number;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  error?: string | null;
  disabled?: boolean;
}

const DEFAULT_ACCEPTED_TYPES = [
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

const DEFAULT_MAX_SIZE_MB = 10;

const FILE_TYPE_LABELS: Record<string, string> = {
  "application/pdf": "PDF",
  "text/csv": "CSV",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "application/vnd.ms-excel": "Excel",
};

export function FileUpload({
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  onFileSelect,
  onFileRemove,
  selectedFile,
  error,
  disabled = false,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file type
    const isValidType = acceptedTypes.some((type) => {
      if (type === "application/vnd.ms-excel") {
        return (
          file.type === type ||
          file.name.endsWith(".xls") ||
          file.name.endsWith(".xlsx")
        );
      }
      return file.type === type || file.name.endsWith(type.split("/")[1]);
    });

    if (!isValidType) {
      return "Invalid format. Please upload PDF, CSV, or Excel files only.";
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit. Please upload a smaller file.`;
    }

    return null;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setLocalError(null);
    onFileSelect(file);
  };

  const handleClick = () => {
    if (!disabled && !selectedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileRemove();
    setLocalError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return null;
    const type = FILE_TYPE_LABELS[selectedFile.type] || "File";
    return type;
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept={acceptedTypes.join(",")}
        className="hidden"
        aria-label="File upload input"
      />

      <AnimatePresence mode="wait">
        {selectedFile ? (
          <motion.div
            key="file-selected"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              "relative flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
              displayError
                ? "border-[#C62828] bg-red-50"
                : "border-[#1B4F6B] bg-[#1B4F6B]/5"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                displayError
                  ? "bg-red-100 text-[#C62828]"
                  : "bg-[#1B4F6B]/10 text-[#1B4F6B]"
              )}
            >
              <File className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0D2B3E] truncate">
                {selectedFile.name}
              </p>
              <p className="text-sm text-gray-500">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {getFileIcon()}
              </p>
            </div>

            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
                aria-label="Remove file"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="drop-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={handleClick}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleClick();
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all cursor-pointer",
                isDragging
                  ? "border-[#1B4F6B] bg-[#1B4F6B]/5"
                  : "border-gray-300 hover:border-[#1B4F6B] hover:bg-gray-50",
                disabled && "opacity-50 cursor-not-allowed pointer-events-none"
              )}
              aria-label="File upload area"
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors",
                  isDragging
                    ? "bg-[#1B4F6B]/20 text-[#1B4F6B]"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                <Upload className="w-8 h-8" />
              </div>

              <p className="text-lg font-medium text-[#0D2B3E] mb-1">
                {isDragging
                  ? "Drop your file here"
                  : "Drag and drop your file here"}
              </p>
              <p className="text-sm text-gray-500 mb-3">or click to browse</p>

              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span>PDF, CSV, Excel</span>
                <span>•</span>
                <span>Max {maxSizeMB}MB</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {displayError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 mt-3 text-sm text-[#C62828]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{displayError}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}