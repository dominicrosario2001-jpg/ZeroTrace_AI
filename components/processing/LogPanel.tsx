"use client";

import { useEffect, useRef } from "react";
import { Terminal, Trash2 } from "lucide-react";
import { LogEntry } from "@/utils/types";

interface Props {
  logs: LogEntry[];
  onClear: () => void;
}

const LEVEL_STYLES: Record<LogEntry["level"], string> = {
  info: "text-ghost-300",
  success: "text-safe",
  warn: "text-warn",
  error: "text-danger",
};

export function LogPanel({ logs, onClear }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest log
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="card-border rounded-xl overflow-hidden flex flex-col h-64">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-ink-700 bg-ink-800/60">
        <div className="flex items-center gap-2">
          {/* Traffic light dots */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-danger/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-warn/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-safe/60" />
          </div>
          <Terminal className="w-3.5 h-3.5 text-ghost-400 ml-1" />
          <span className="text-ghost-400 font-mono text-xs">
            localai.process — live log
          </span>
        </div>
        <button
          onClick={onClear}
          className="text-ghost-400 hover:text-ghost-200 transition-colors"
          title="Clear logs"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto p-3 bg-ink-900/80 scanlines relative">
        {logs.length === 0 ? (
          <p className="text-ghost-400 font-mono text-xs">
            <span className="text-safe">$</span> Waiting for files...
            <span className="animate-blink">_</span>
          </p>
        ) : (
          <div className="space-y-0.5">
            {logs.map((entry) => (
              <LogLine key={entry.id} entry={entry} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const time = new Date(entry.timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="flex gap-2 animate-slide-in terminal-text">
      <span className="text-ink-500 flex-shrink-0 select-none">{time}</span>
      <span className={`${LEVEL_STYLES[entry.level]} leading-5`}>
        {entry.message}
      </span>
    </div>
  );
}
