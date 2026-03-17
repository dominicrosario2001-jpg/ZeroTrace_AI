/**
 * AI Analysis — local heuristic-based processing.
 *
 * Architecture note: These functions are intentionally structured to be
 * drop-in replaceable with a local LLM (e.g., WebLLM, Transformers.js,
 * or llama.cpp wasm) without changing the calling code.
 *
 * The interface matches what an LLM would return, making future upgrades trivial.
 */

import { DocumentType } from "./types";

// ─── Document Type Detection ───────────────────────────────────────────────

const DOCUMENT_PATTERNS: Record<DocumentType, string[]> = {
  resume: [
    "experience", "education", "skills", "objective", "summary",
    "employment", "work history", "curriculum vitae", "cv", "linkedin",
    "references", "certifications", "achievements", "responsibilities"
  ],
  invoice: [
    "invoice", "bill to", "payment due", "total amount", "subtotal",
    "tax", "invoice number", "due date", "purchase order", "qty",
    "unit price", "amount due", "remit to", "net 30", "balance due"
  ],
  contract: [
    "agreement", "whereas", "hereinafter", "party", "obligations",
    "terms and conditions", "jurisdiction", "liability", "indemnify",
    "arbitration", "governing law", "breach", "termination"
  ],
  article: [
    "abstract", "introduction", "conclusion", "references", "methodology",
    "discussion", "findings", "hypothesis", "research", "published",
    "author", "journal", "doi", "keywords"
  ],
  generic: [],
};

/**
 * Detect document type using keyword frequency analysis.
 * This is a fast, offline heuristic — no ML required.
 */
export function detectDocumentType(text: string): DocumentType {
  const normalized = text.toLowerCase();
  const scores: Record<DocumentType, number> = {
    resume: 0,
    invoice: 0,
    contract: 0,
    article: 0,
    generic: 0,
  };

  for (const [type, keywords] of Object.entries(DOCUMENT_PATTERNS)) {
    if (type === "generic") continue;
    for (const kw of keywords) {
      // Count occurrences; weight rare, specific terms higher
      const count = (normalized.match(new RegExp(kw, "g")) || []).length;
      scores[type as DocumentType] += count;
    }
  }

  const best = Object.entries(scores).reduce((a, b) => (a[1] > b[1] ? a : b));
  return best[1] > 2 ? (best[0] as DocumentType) : "generic";
}

// ─── Summary Generation ────────────────────────────────────────────────────

/**
 * Generate a structured summary from extracted text.
 *
 * MVP: Uses extractive summarization (picks meaningful sentences).
 * Future: Replace with Transformers.js summarization pipeline or local LLM.
 */
export function generateSummary(text: string, docType: DocumentType): string {
  if (!text || text.length < 50) {
    return "Insufficient text content to generate a summary.";
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  // Split into sentences, filter meaningful ones
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 300 && /[a-zA-Z]/.test(s));

  // Score sentences by position and keyword density
  const topSentences = sentences
    .slice(0, Math.min(sentences.length, 20))
    .sort((a, b) => scoresentence(b, docType) - scoresentence(a, docType))
    .slice(0, 3);

  const docTypeLabel: Record<DocumentType, string> = {
    resume: "Professional Resume / CV",
    invoice: "Invoice / Billing Document",
    contract: "Legal Contract / Agreement",
    article: "Article / Research Document",
    generic: "General Document",
  };

  const lines = [
    `**Document Type:** ${docTypeLabel[docType]}`,
    `**Length:** ${wordCount.toLocaleString()} words · ${charCount.toLocaleString()} characters`,
    ``,
    `**Key Excerpts:**`,
    ...topSentences.map((s) => `• ${s.trim()}`),
    ``,
    `**Processing:** Extracted locally via ${docType === "generic" ? "text analysis" : "pattern matching"} · No AI APIs used`,
  ];

  return lines.join("\n");
}

function scoresentence(sentence: string, docType: DocumentType): number {
  let score = 0;
  const lower = sentence.toLowerCase();
  const keywords = DOCUMENT_PATTERNS[docType];

  for (const kw of keywords) {
    if (lower.includes(kw)) score += 2;
  }

  // Prefer sentences with numbers (dates, amounts, stats)
  if (/\d/.test(sentence)) score += 1;

  // Penalize sentences that start with articles/conjunctions
  if (/^(the|a|an|and|but|or)\s/i.test(sentence)) score -= 1;

  return score;
}

// ─── Structured Data Extraction ────────────────────────────────────────────

export interface StructuredOutput {
  docType: DocumentType;
  confidence: "high" | "medium" | "low";
  keyFields: Record<string, string>;
  wordCount: number;
  language: string;
  readingTime: string;
}

/** Extract structured metadata from document text */
export function extractStructuredData(
  text: string,
  docType: DocumentType
): StructuredOutput {
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTimeMin = Math.ceil(wordCount / 200);

  // Detect keywords that boost confidence
  const patternHits = (DOCUMENT_PATTERNS[docType] || []).filter((kw) =>
    text.toLowerCase().includes(kw)
  ).length;
  const confidence =
    patternHits >= 4 ? "high" : patternHits >= 2 ? "medium" : "low";

  // Extract type-specific fields
  const keyFields = extractKeyFields(text, docType);

  return {
    docType,
    confidence,
    keyFields,
    wordCount,
    language: detectLanguage(text),
    readingTime: `~${readingTimeMin} min`,
  };
}

function extractKeyFields(
  text: string,
  docType: DocumentType
): Record<string, string> {
  const fields: Record<string, string> = {};

  // Extract email
  const email = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/);
  if (email) fields["Email"] = email[0];

  // Extract phone
  const phone = text.match(/(\+?\d[\d\s\-().]{8,}\d)/);
  if (phone) fields["Phone"] = phone[0].trim();

  // Extract URLs
  const url = text.match(/https?:\/\/[^\s]+/);
  if (url) fields["URL"] = url[0];

  if (docType === "invoice") {
    // Extract invoice number
    const invNum = text.match(/invoice\s*#?\s*:?\s*([\w-]+)/i);
    if (invNum) fields["Invoice #"] = invNum[1];

    // Extract total
    const total = text.match(/total\s*:?\s*\$?([\d,]+\.?\d*)/i);
    if (total) fields["Total"] = `$${total[1]}`;

    // Extract due date
    const due = text.match(/due\s*date\s*:?\s*([\w\s,]+\d{4})/i);
    if (due) fields["Due Date"] = due[1].trim();
  }

  if (docType === "resume") {
    // Extract name (first line heuristic)
    const firstLine = text.split("\n")[0]?.trim();
    if (firstLine && firstLine.length < 50 && /^[A-Z]/.test(firstLine)) {
      fields["Name"] = firstLine;
    }
  }

  return fields;
}

/** Simple language detection heuristic */
function detectLanguage(text: string): string {
  const sample = text.slice(0, 500).toLowerCase();
  const englishWords = ["the", "and", "is", "in", "of", "to", "a"];
  const hits = englishWords.filter((w) =>
    new RegExp(`\\b${w}\\b`).test(sample)
  ).length;

  return hits >= 4 ? "English" : "Unknown / Non-English";
}
