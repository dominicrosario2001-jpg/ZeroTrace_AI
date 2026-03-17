"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { PrivacyBanner } from "@/components/layout/PrivacyBanner";
import { DropZone } from "@/components/processing/DropZone";
import { FileCard } from "@/components/processing/FileCard";
import { LogPanel } from "@/components/processing/LogPanel";
import { StatsBar } from "@/components/processing/StatsBar";
import { useLogger } from "@/hooks/useLogger";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { usePrivacyStats } from "@/hooks/usePrivacyStats";

export default function Home() {
  const [offlineMode, setOfflineMode] = useState(false);

  // Logging system
  const logger = useLogger();

  // Privacy stats tracker
  const { stats, incrementProcessed, sessionDuration } = usePrivacyStats();

  // File processing orchestrator
  const {
    files,
    addFiles,
    removeFile,
    clearAll,
    completedFiles,
    isProcessing,
  } = useFileProcessor({
    ...logger,
    // Wrap logger.success to also increment privacy stats counter
    success: (msg: string, fileId?: string) => {
      logger.success(msg, fileId);
      if (msg.includes("Processed locally")) {
        incrementProcessed();
      }
    },
  });

  return (
    <div className="min-h-screen bg-ink-900 relative">
      {/* Subtle radial gradient backdrop */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,255,136,0.04) 0%, transparent 60%)",
        }}
      />

      {/* Privacy Banner — sticky at top */}
      <PrivacyBanner
        stats={stats}
        offlineMode={offlineMode}
        onToggleOffline={() => setOfflineMode((v) => !v)}
        sessionDuration={sessionDuration}
      />

      <div className="relative max-w-7xl mx-auto px-4 pb-16">
        {/* Header */}
        <Header />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column — Upload + Log */}
          <div className="lg:col-span-2 space-y-4">
            <DropZone
              onFilesAdded={addFiles}
              isProcessing={isProcessing}
              fileCount={files.length}
            />

            {/* Live Log Panel */}
            <LogPanel logs={logger.logs} onClear={logger.clearLogs} />

            {/* Privacy guarantee card */}
            <PrivacyCard />
          </div>

          {/* Right Column — File Results */}
          <div className="lg:col-span-3 space-y-3">
            {files.length > 0 && (
              <StatsBar files={files} onClearAll={clearAll} />
            )}

            {files.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <FileCard key={file.id} file={file} onRemove={removeFile} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compact privacy guarantee card shown below the log panel */
function PrivacyCard() {
  return (
    <div className="card-border rounded-xl p-4 space-y-2">
      <p className="text-ghost-300 font-mono text-xs font-semibold uppercase tracking-wider">
        How privacy works
      </p>
      {[
        ["🔒", "Files read via FileReader API — browser-only"],
        ["⚙", "pdf.js & Tesseract run in Web Workers"],
        ["🧠", "AI analysis: local heuristics, zero API calls"],
        ["📦", "Downloads use Blob URLs — no server"],
        ["✓", "0 bytes uploaded, guaranteed"],
      ].map(([icon, text]) => (
        <div key={text} className="flex items-start gap-2">
          <span className="text-sm flex-shrink-0">{icon}</span>
          <span className="text-ghost-400 font-mono text-xs">{text}</span>
        </div>
      ))}
    </div>
  );
}

/** Shown when no files have been added yet */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-ink-600 rounded-2xl">
      <p className="text-ghost-400 font-mono text-sm">No files processed yet</p>
      <p className="text-ghost-400 font-mono text-xs mt-1">
        Drop files in the upload zone →
      </p>
    </div>
  );
}
