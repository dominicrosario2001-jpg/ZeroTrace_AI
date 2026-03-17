/**
 * PDF text extraction using pdf.js (fully client-side)
 * The PDF bytes never leave the browser — processing happens in a Web Worker
 * that pdf.js manages internally.
 */

export async function extractTextFromPDF(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  // Dynamically import pdfjs to avoid SSR issues
  const pdfjsLib = await import("pdfjs-dist");

  // Point to the bundled worker (served from public/)
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const totalPages = pdf.numPages;
  const textParts: string[] = [];

  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();

    // Join text items with smart spacing
    const pageText = content.items
      .map((item: any) => ("str" in item ? item.str : ""))
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();

    if (pageText) {
      textParts.push(`--- Page ${pageNum} ---\n${pageText}`);
    }

    // Report progress
    onProgress?.(Math.round((pageNum / totalPages) * 100));
  }

  return textParts.join("\n\n") || "No readable text found in this PDF.";
}
