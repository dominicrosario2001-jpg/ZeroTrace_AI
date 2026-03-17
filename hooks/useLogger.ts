"use client";

import { useState, useCallback } from "react";
import { LogEntry } from "@/utils/types";
import { generateId } from "@/utils/fileUtils";

/** Central logging hook — provides typed log entries for the live terminal panel */
export function useLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const addLog = useCallback(
    (
      message: string,
      level: LogEntry["level"] = "info",
      fileId?: string
    ) => {
      const entry: LogEntry = {
        id: generateId(),
        timestamp: Date.now(),
        message,
        level,
        fileId,
      };
      setLogs((prev) => [...prev.slice(-199), entry]); // Keep last 200 entries
    },
    []
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  // Convenience helpers
  const log = useCallback((msg: string, fileId?: string) => addLog(msg, "info", fileId), [addLog]);
  const success = useCallback((msg: string, fileId?: string) => addLog(msg, "success", fileId), [addLog]);
  const warn = useCallback((msg: string, fileId?: string) => addLog(msg, "warn", fileId), [addLog]);
  const error = useCallback((msg: string, fileId?: string) => addLog(msg, "error", fileId), [addLog]);

  return { logs, log, success, warn, error, clearLogs };
}

export type Logger = ReturnType<typeof useLogger>;
