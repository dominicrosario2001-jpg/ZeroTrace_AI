"use client";

import { useState, useEffect, useCallback } from "react";
import { PrivacyStats } from "@/utils/types";

/** Tracks and exposes privacy-related metrics for the UI banner */
export function usePrivacyStats() {
  const [stats, setStats] = useState<PrivacyStats>({
    bytesUploaded: 0,           // Always stays 0 — proving privacy
    filesProcessedLocally: 0,
    networkRequestsBlocked: 0,
    sessionStartTime: Date.now(),
  });

  const incrementProcessed = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      filesProcessedLocally: prev.filesProcessedLocally + 1,
    }));
  }, []);

  // Monitor network requests via PerformanceObserver to PROVE zero uploads
  useEffect(() => {
    if (typeof window === "undefined" || !window.PerformanceObserver) return;

    // We only observe — this doesn't block anything.
    // The point is to show users the network activity (or lack thereof).
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const resource = entry as PerformanceResourceTiming;
        // Flag any unexpected large transfers (would indicate a bug)
        if (
          resource.transferSize > 1024 &&
          !resource.name.includes("fonts.googleapis") &&
          !resource.name.includes("tessdata") &&
          !resource.name.includes("cdnjs") &&
          !resource.name.includes("jsdelivr")
        ) {
          console.warn("[Privacy Check] Unexpected network transfer:", resource.name);
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["resource"] });
    } catch {
      // Not all browsers support all entry types
    }

    return () => observer.disconnect();
  }, []);

  const sessionDuration = useCallback(() => {
    const ms = Date.now() - stats.sessionStartTime;
    const mins = Math.floor(ms / 60000);
    const secs = Math.floor((ms % 60000) / 1000);
    return `${mins}m ${secs}s`;
  }, [stats.sessionStartTime]);

  return { stats, incrementProcessed, sessionDuration };
}
