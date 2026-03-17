"use client";

import { useCallback, useState, useRef } from "react";
import { Upload, FileText, Image, Music, AlertTriangle } from "lucide-react";
import { ACCEPTED_MIME_TYPES, isOverMaxSize, formatFileSize } from "@/utils/fileUtils";

interface Props {
  onFilesAdded: (files: File[]) => void;
  isProcessing: boolean;
  fileCount: number;
}

export function DropZone({ onFilesAdded, isProcessing, fileCount }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setDragError(null);

      const droppedFiles = Array.from(e.dataTransfer.files);
      validateAndAdd(droppedFiles);
    },
    [onFilesAdded]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only trigger if leaving the drop zone entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        validateAndAdd(Array.from(e.target.files));
      }
      // Reset input so the same file can be re-added if needed
      e.target.value = "";
    },
    [onFilesAdded]
  );

  function validateAndAdd(files: File[]) {
    const oversized = files.filter(isOverMaxSize);
    if (oversized.length > 0) {
      setDragError(
        `${oversized[0].name} is too large (max 100MB, got ${formatFileSize(oversized[0].size)})`
      );
      setTimeout(() => setDragError(null), 4000);
    }

    const valid = files.filter(
      (f) =>
        ACCEPTED_MIME_TYPES.includes(f.type) && !isOverMaxSize(f)
    );
    if (valid.length > 0) onFilesAdded(valid);
  }

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`
          relative overflow-hidden rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-300 p-10 text-center group
          ${isDragging
            ? "drop-active border-safe"
            : "border-ink-500 hover:border-ghost-400 bg-ink-800/40 hover:bg-ink-800/60"
          }
        `}
      >
        {/* Scan line effect when dragging */}
        {isDragging && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-safe to-transparent opacity-60 animate-scan"
              style={{ animation: "scan 1.5s linear infinite" }}
            />
          </div>
        )}

        {/* Icon Grid */}
        <div className="flex items-center justify-center gap-3 mb-5">
          <FileTypeIcon icon={<FileText className="w-5 h-5" />} label="PDF" />
          <FileTypeIcon icon={<Image className="w-5 h-5" />} label="IMG" />
          <FileTypeIcon icon={<Music className="w-5 h-5" />} label="AUD" />
        </div>

        {/* Upload Icon */}
        <div
          className={`
            mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all
            ${isDragging
              ? "bg-safe/20 text-safe scale-110"
              : "bg-ink-700 text-ghost-400 group-hover:bg-ink-600 group-hover:text-ghost-200"
            }
          `}
        >
          <Upload className="w-6 h-6" />
        </div>

        <h3 className="text-ghost-100 font-display text-lg font-semibold mb-1">
          {isDragging ? "Release to process locally" : "Drop files here"}
        </h3>
        <p className="text-ghost-400 text-sm">
          or{" "}
          <span className="text-neon-blue underline underline-offset-2">
            click to browse
          </span>
        </p>
        <p className="text-ghost-400 text-xs mt-3 font-mono">
          PDF · PNG · JPG · WEBP · MP3 · WAV · M4A &nbsp;·&nbsp; Max 100MB
        </p>

        {/* Batch hint */}
        {fileCount === 0 && (
          <p className="text-ghost-400 text-xs mt-1.5 font-mono">
            Supports batch upload — drop multiple files at once
          </p>
        )}
      </div>

      {/* Error Toast */}
      {dragError && (
        <div className="mt-2 flex items-center gap-2 bg-danger/10 border border-danger/30 rounded-lg px-3 py-2 animate-fade-up">
          <AlertTriangle className="w-4 h-4 text-danger flex-shrink-0" />
          <span className="text-danger text-xs font-mono">{dragError}</span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_MIME_TYPES.join(",")}
        onChange={handleFileInput}
        className="hidden"
      />
    </div>
  );
}

function FileTypeIcon({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-9 h-9 rounded-lg bg-ink-700 border border-ink-500 flex items-center justify-center text-ghost-400">
        {icon}
      </div>
      <span className="text-ghost-400 text-[10px] font-mono">{label}</span>
    </div>
  );
}
