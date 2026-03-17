// Core types for LocalAI file processor

export type FileType = "pdf" | "image" | "audio" | "unknown";
export type ProcessingStatus =
  | "idle"
  | "loading"
  | "processing"
  | "done"
  | "error";
export type DocumentType = "resume" | "invoice" | "contract" | "article" | "generic";

export interface ProcessedFile {
  id: string;
  file: File;
  type: FileType;
  status: ProcessingStatus;
  preview?: string; // object URL for images
  extractedText?: string;
  summary?: string;
  documentType?: DocumentType;
  processingTimeMs?: number;
  error?: string;
  progress?: number; // 0–100
}

export interface LogEntry {
  id: string;
  timestamp: number;
  message: string;
  level: "info" | "success" | "warn" | "error";
  fileId?: string;
}

export interface PrivacyStats {
  bytesUploaded: number;       // Always 0
  filesProcessedLocally: number;
  networkRequestsBlocked: number;
  sessionStartTime: number;
}

export interface ProcessingResult {
  extractedText: string;
  summary: string;
  documentType: DocumentType;
  processingTimeMs: number;
}
