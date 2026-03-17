"use client";

import { useState } from "react";
import {
  FileText, Image, Music, X, ChevronDown, ChevronUp,
  Download, Clock, CheckCircle2, AlertCircle, Loader2,
  Tag, Layers, AlignLeft
} from "lucide-react";
import { ProcessedFile, DocumentType } from "@/utils/types";
import { formatFileSize, formatTime } from "@/utils/fileUtils";
import { downloadText, downloadJSON } from "@/utils/downloadUtils";
import { extractStructuredData } from "@/utils/aiAnalysis";

interface Props {
  file: ProcessedFile;
  onRemove: (id: string) => void;
}

const DOC_TYPE_META: Record<DocumentType, { label: string; color: string; bg: string }> = {
  resume: { label: "Resume / CV", color: "text-neon-blue", bg: "bg-neon-blue/10 border-neon-blue/30" },
  invoice: { label: "Invoice", color: "text-warn", bg: "bg-warn/10 border-warn/30" },
  contract: { label: "Contract", color: "text-neon-purple", bg: "bg-neon-purple/10 border-neon-purple/30" },
  article: { label: "Article", color: "text-neon-green", bg: "bg-neon-green/10 border-neon-green/30" },
  generic: { label: "Document", color: "text-ghost-300", bg: "bg-ghost-300/10 border-ghost-300/30" },
};

const FILE_ICON = {
  pdf: <FileText className="w-4 h-4" />,
  image: <Image className="w-4 h-4" />,
  audio: <Music className="w-4 h-4" />,
  unknown: <FileText className="w-4 h-4" />,
};

export function FileCard({ file, onRemove }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"text" | "summary" | "structured">("summary");

  const docMeta = file.documentType ? DOC_TYPE_META[file.documentType] : null;

  function handleDownloadText() {
    if (file.extractedText) {
      downloadText(file.extractedText, `${file.file.name}_extracted.txt`);
    }
  }

  function handleDownloadJSON() {
    if (file.documentType && file.extractedText) {
      const structured = extractStructuredData(file.extractedText, file.documentType);
      downloadJSON(
        { ...structured, fileName: file.file.name, processedLocally: true, bytesUploaded: 0 },
        `${file.file.name}_structured.json`
      );
    }
  }

  return (
    <div className={`card-border rounded-xl overflow-hidden transition-all duration-300 animate-fade-up ${
      file.status === "done" ? "glow-green" : ""
    }`}>
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        {/* Preview or Icon */}
        <div className="flex-shrink-0">
          {file.preview ? (
            <img
              src={file.preview}
              alt={file.file.name}
              className="w-12 h-12 object-cover rounded-lg border border-ink-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-ink-700 border border-ink-600 flex items-center justify-center text-ghost-400">
              {FILE_ICON[file.type]}
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-ghost-100 font-sans font-medium text-sm truncate">
                {file.file.name}
              </p>
              <p className="text-ghost-400 font-mono text-xs mt-0.5">
                {formatFileSize(file.file.size)}
                {file.processingTimeMs && (
                  <span className="ml-2 text-safe">
                    · Processed in {formatTime(file.processingTimeMs)}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => onRemove(file.id)}
              className="flex-shrink-0 text-ghost-400 hover:text-danger transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status + Progress */}
          <div className="mt-2">
            <StatusIndicator file={file} />
          </div>

          {/* Doc type badge */}
          {file.status === "done" && docMeta && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-mono ${docMeta.bg} ${docMeta.color}`}>
                <Tag className="w-3 h-3" />
                {docMeta.label}
              </span>
              {file.processingTimeMs && (
                <span className="inline-flex items-center gap-1 text-ghost-400 text-xs font-mono">
                  <Clock className="w-3 h-3" />
                  {formatTime(file.processingTimeMs)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Expand / Collapse for results */}
      {file.status === "done" && (
        <>
          <div className="border-t border-ink-700 px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {(["summary", "text", "structured"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setExpanded(true); }}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono transition-all ${
                    activeTab === tab && expanded
                      ? "bg-ink-600 text-ghost-100"
                      : "text-ghost-400 hover:text-ghost-200"
                  }`}
                >
                  {tab === "summary" && <><Layers className="inline w-3 h-3 mr-1" />Summary</>}
                  {tab === "text" && <><AlignLeft className="inline w-3 h-3 mr-1" />Text</>}
                  {tab === "structured" && <><Tag className="inline w-3 h-3 mr-1" />Structured</>}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1">
              {file.extractedText && (
                <button
                  onClick={handleDownloadText}
                  className="p-1.5 rounded-md text-ghost-400 hover:text-neon-blue hover:bg-neon-blue/10 transition-all"
                  title="Download extracted text"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setExpanded((e) => !e)}
                className="p-1.5 rounded-md text-ghost-400 hover:text-ghost-200 transition-all"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Result Panel */}
          {expanded && (
            <div className="border-t border-ink-700 p-4 bg-ink-800/30 animate-fade-up">
              {activeTab === "summary" && (
                <SummaryTab summary={file.summary} />
              )}
              {activeTab === "text" && (
                <TextTab text={file.extractedText} />
              )}
              {activeTab === "structured" && file.extractedText && file.documentType && (
                <StructuredTab
                  text={file.extractedText}
                  docType={file.documentType}
                  onDownload={handleDownloadJSON}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* Error state */}
      {file.status === "error" && (
        <div className="border-t border-danger/20 px-4 py-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
          <p className="text-danger text-xs font-mono">{file.error}</p>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────

function StatusIndicator({ file }: { file: ProcessedFile }) {
  if (file.status === "idle") return null;

  if (file.status === "done") {
    return (
      <div className="flex items-center gap-1.5 text-safe">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span className="text-xs font-mono">Processing complete</span>
      </div>
    );
  }

  if (file.status === "error") {
    return (
      <div className="flex items-center gap-1.5 text-danger">
        <AlertCircle className="w-3.5 h-3.5" />
        <span className="text-xs font-mono">Failed</span>
      </div>
    );
  }

  // Loading / processing
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-neon-blue">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span className="text-xs font-mono">
          {file.status === "loading" ? "Initializing..." : "Processing locally..."}
        </span>
      </div>
      <div className="h-1 bg-ink-700 rounded-full overflow-hidden">
        <div
          className="h-full progress-shimmer rounded-full transition-all duration-300"
          style={{ width: `${file.progress ?? 0}%` }}
        />
      </div>
    </div>
  );
}

function SummaryTab({ summary }: { summary?: string }) {
  if (!summary) return <p className="text-ghost-400 text-xs font-mono">No summary available.</p>;

  return (
    <div className="space-y-1">
      {summary.split("\n").map((line, i) => {
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="text-ghost-300 text-xs font-mono font-semibold mt-2 first:mt-0">
              {line.replace(/\*\*/g, "")}
            </p>
          );
        }
        if (line.startsWith("• ")) {
          return (
            <p key={i} className="text-ghost-200 text-xs font-mono pl-2">
              {line}
            </p>
          );
        }
        if (line.startsWith("**") && line.includes(":**")) {
          const [label, ...rest] = line.replace(/\*\*/g, "").split(":");
          return (
            <div key={i} className="flex gap-2 text-xs font-mono">
              <span className="text-ghost-400 flex-shrink-0">{label}:</span>
              <span className="text-ghost-100">{rest.join(":").trim()}</span>
            </div>
          );
        }
        return line ? (
          <p key={i} className="text-ghost-200 text-xs font-mono">{line}</p>
        ) : <div key={i} className="h-1" />;
      })}
    </div>
  );
}

function TextTab({ text }: { text?: string }) {
  if (!text) return <p className="text-ghost-400 text-xs font-mono">No text extracted.</p>;
  return (
    <div className="max-h-48 overflow-y-auto">
      <pre className="text-ghost-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
        {text.slice(0, 3000)}
        {text.length > 3000 && (
          <span className="text-ghost-400">
            {"\n\n"}... {(text.length - 3000).toLocaleString()} more characters
          </span>
        )}
      </pre>
    </div>
  );
}

function StructuredTab({
  text,
  docType,
  onDownload,
}: {
  text: string;
  docType: DocumentType;
  onDownload: () => void;
}) {
  
  const data = extractStructuredData(text, docType);

  const confidenceColor = {
    high: "text-safe",
    medium: "text-warn",
    low: "text-ghost-400",
  }[data.confidence];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Field label="Document Type" value={data.docType} />
        <Field label="Confidence" value={data.confidence} valueClass={confidenceColor} />
        <Field label="Word Count" value={data.wordCount.toLocaleString()} />
        <Field label="Reading Time" value={data.readingTime} />
        <Field label="Language" value={data.language} />
      </div>

      {Object.keys(data.keyFields).length > 0 && (
        <div className="border-t border-ink-700 pt-3">
          <p className="text-ghost-400 text-xs font-mono mb-2 uppercase tracking-wider">Extracted Fields</p>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.entries(data.keyFields).map(([k, v]) => (
              <Field key={k} label={k} value={v as string} />
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onDownload}
        className="flex items-center gap-1.5 text-xs font-mono text-neon-blue hover:text-neon-blue/80 transition-colors mt-1"
      >
        <Download className="w-3 h-3" />
        Download as JSON
      </button>
    </div>
  );
}

function Field({ label, value, valueClass = "text-ghost-100" }: {
  label: string; value: string; valueClass?: string;
}) {
  return (
    <div className="flex gap-2 text-xs font-mono">
      <span className="text-ghost-400 flex-shrink-0 min-w-[90px]">{label}:</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}
