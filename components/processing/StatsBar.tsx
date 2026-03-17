"use client";

import { Archive, Download } from "lucide-react";
import { ProcessedFile } from "@/utils/types";
import { downloadAsZip } from "@/utils/downloadUtils";

interface Props {
  files: ProcessedFile[];
  onClearAll: () => void;
}

export function StatsBar({ files, onClearAll }: Props) {
  const done = files.filter((f) => f.status === "done");
  const processing = files.filter((f) =>
    ["loading", "processing"].includes(f.status)
  );
  const errors = files.filter((f) => f.status === "error");

  if (files.length === 0) return null;

  async function handleDownloadZip() {
    if (done.length > 0) await downloadAsZip(done);
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-ink-800/40 border border-ink-700 rounded-xl px-4 py-3">
      {/* Stats */}
      <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
        <span className="text-ghost-400">
          Total:{" "}
          <span className="text-ghost-100 font-semibold">{files.length}</span>
        </span>
        {done.length > 0 && (
          <span className="text-ghost-400">
            Done:{" "}
            <span className="text-safe font-semibold">{done.length}</span>
          </span>
        )}
        {processing.length > 0 && (
          <span className="text-ghost-400">
            Processing:{" "}
            <span className="text-neon-blue font-semibold">
              {processing.length}
            </span>
          </span>
        )}
        {errors.length > 0 && (
          <span className="text-ghost-400">
            Errors:{" "}
            <span className="text-danger font-semibold">{errors.length}</span>
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {done.length >= 2 && (
          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-safe/10 border border-safe/30 text-safe text-xs font-mono rounded-lg hover:bg-safe/20 transition-all"
          >
            <Archive className="w-3.5 h-3.5" />
            Download ZIP ({done.length})
          </button>
        )}
        <button
          onClick={onClearAll}
          className="px-3 py-1.5 border border-ink-600 text-ghost-400 text-xs font-mono rounded-lg hover:border-danger/40 hover:text-danger transition-all"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
