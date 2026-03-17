/**
 * Client-side ZIP generation using JSZip.
 * Files are assembled in-memory and offered as a download — no server needed.
 */

import JSZip from "jszip";
import { ProcessedFile } from "./types";

export async function downloadAsZip(files: ProcessedFile[]): Promise<void> {
  const zip = new JSZip();
  const folder = zip.folder("localai-output")!;

  for (const pf of files) {
    if (!pf.extractedText) continue;

    const safeName = pf.file.name.replace(/\.[^.]+$/, "");

    // Add extracted text
    folder.file(`${safeName}_extracted.txt`, pf.extractedText);

    // Add summary if available
    if (pf.summary) {
      folder.file(`${safeName}_summary.txt`, pf.summary);
    }

    // Add structured JSON
    if (pf.documentType) {
      const meta = {
        fileName: pf.file.name,
        fileSize: pf.file.size,
        documentType: pf.documentType,
        processingTimeMs: pf.processingTimeMs,
        processedLocally: true,
        bytesUploaded: 0,
      };
      folder.file(`${safeName}_metadata.json`, JSON.stringify(meta, null, 2));
    }
  }

  // Generate and trigger download
  const blob = await zip.generateAsync({ type: "blob" });
  triggerDownload(blob, "localai-output.zip");
}

export function downloadText(text: string, filename: string): void {
  const blob = new Blob([text], { type: "text/plain" });
  triggerDownload(blob, filename);
}

export function downloadJSON(data: object, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  // Clean up the object URL after a short delay
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
