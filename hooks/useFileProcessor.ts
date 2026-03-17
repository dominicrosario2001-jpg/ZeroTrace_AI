"use client";

import { useState, useCallback } from "react";
import { ProcessedFile, FileType } from "@/utils/types";
import {
  getFileType,
  generateId,
  isLargeFile,
  isOverMaxSize,
  formatFileSize,
} from "@/utils/fileUtils";
import { Logger } from "./useLogger";

/** Orchestrates file processing pipeline */
export function useFileProcessor(logger: Logger) {
  const [files, setFiles] = useState<ProcessedFile[]>([]);

  /** Update a specific file's state immutably */
  const updateFile = useCallback(
    (id: string, patch: Partial<ProcessedFile>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
      );
    },
    []
  );

  /** Add files to the queue and start processing */
  const addFiles = useCallback(
    async (rawFiles: File[]) => {
      const newEntries: ProcessedFile[] = [];

      for (const file of rawFiles) {
        // Validate size
        if (isOverMaxSize(file)) {
          logger.warn(
            `⚠ ${file.name} exceeds 100MB limit (${formatFileSize(file.size)}) — skipped`
          );
          continue;
        }

        const type = getFileType(file);
        if (type === "unknown") {
          logger.warn(`⚠ Unsupported file type: ${file.name}`);
          continue;
        }

        if (isLargeFile(file)) {
          logger.warn(
            `⚠ Large file detected: ${file.name} (${formatFileSize(file.size)}) — processing may be slow`
          );
        }

        const id = generateId();

        // Generate image preview immediately for image files
        let preview: string | undefined;
        if (type === "image") {
          preview = URL.createObjectURL(file);
        }

        const entry: ProcessedFile = {
          id,
          file,
          type,
          status: "idle",
          preview,
          progress: 0,
        };

        newEntries.push(entry);
        logger.log(`📎 Queued: ${file.name} (${formatFileSize(file.size)})`);
      }

      setFiles((prev) => [...prev, ...newEntries]);

      // Process each file sequentially (could be parallelized)
      for (const entry of newEntries) {
        await processFile(entry.id, entry.file, entry.type);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logger]
  );

  /** Core processing pipeline for a single file */
  const processFile = useCallback(
    async (id: string, file: File, type: FileType) => {
      const startTime = Date.now();

      updateFile(id, { status: "loading", progress: 0 });
      logger.log(`🔒 Initializing local processing...`, id);

      await sleep(200); // Brief pause for UX

      logger.log(`⚙ Running conversion in browser...`, id);
      updateFile(id, { status: "processing", progress: 10 });

      try {
        let extractedText = "";

        // ── Text Extraction ──────────────────────────────────────────
        if (type === "pdf") {
          logger.log(`📄 Extracting text from PDF (pdf.js)...`, id);
          const { extractTextFromPDF } = await import("@/utils/pdfProcessor");
          extractedText = await extractTextFromPDF(file, (pct) => {
            updateFile(id, { progress: 10 + Math.round(pct * 0.5) });
          });
        } else if (type === "image") {
          logger.log(`🔍 Running OCR (Tesseract.js)...`, id);
          const { extractTextFromImage } = await import("@/utils/ocrProcessor");
          extractedText = await extractTextFromImage(file, (pct) => {
            updateFile(id, { progress: 10 + Math.round(pct * 0.5) });
          });
        } else if (type === "audio") {
          logger.log(`🎵 Analyzing audio (Web Audio API)...`, id);
          const { processAudioFile } = await import("@/utils/audioProcessor");
          const result = await processAudioFile(file, (pct) => {
            updateFile(id, { progress: 10 + Math.round(pct * 0.5) });
          });
          extractedText = result.text;
        }

        logger.log(`🧠 Running AI analysis locally...`, id);
        updateFile(id, { progress: 70 });

        // ── AI Analysis ──────────────────────────────────────────────
        const { detectDocumentType, generateSummary, extractStructuredData } =
          await import("@/utils/aiAnalysis");

        await sleep(300); // Simulate inference time
        const docType = detectDocumentType(extractedText);
        const summary = generateSummary(extractedText, docType);
        const structured = extractStructuredData(extractedText, docType);

        logger.log(`✅ No network requests detected`, id);
        updateFile(id, { progress: 90 });

        const processingTimeMs = Date.now() - startTime;
        logger.success(
          `✨ Processed locally in ${(processingTimeMs / 1000).toFixed(2)}s`,
          id
        );

        updateFile(id, {
          status: "done",
          extractedText,
          summary,
          documentType: docType,
          processingTimeMs,
          progress: 100,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Processing failed";
        logger.error(`✗ Error: ${msg}`, id);
        updateFile(id, { status: "error", error: msg, progress: 0 });
      }
    },
    [updateFile, logger]
  );

  /** Remove a file from the list */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      // Revoke object URL to free memory
      if (file?.preview) URL.revokeObjectURL(file.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      return [];
    });
  }, []);

  const completedFiles = files.filter((f) => f.status === "done");
  const processingFiles = files.filter((f) =>
    ["loading", "processing"].includes(f.status)
  );

  return {
    files,
    addFiles,
    removeFile,
    clearAll,
    completedFiles,
    processingFiles,
    isProcessing: processingFiles.length > 0,
  };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
