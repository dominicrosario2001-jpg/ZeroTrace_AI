/**
 * Image OCR using Tesseract.js — runs entirely in a Web Worker.
 * No pixel data is ever transmitted over the network.
 */

export async function extractTextFromImage(
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  const Tesseract = await import("tesseract.js");

  // createWorker returns a worker that runs OCR locally
  const worker = await Tesseract.createWorker("eng", 1, {
    // Use a CDN-hosted WASM + training data (fetched once, then cached by browser)
    workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js`,
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    corePath: `https://cdn.jsdelivr.net/npm/tesseract.js-core@5/tesseract-core.wasm.js`,
    logger: (m: any) => {
      if (m.status === "recognizing text") {
        onProgress?.(Math.round((m.progress || 0) * 100));
      }
    },
  });

  try {
    const { data } = await worker.recognize(file);
    await worker.terminate();
    return data.text.trim() || "No text detected in image.";
  } catch (err) {
    await worker.terminate();
    throw err;
  }
}
