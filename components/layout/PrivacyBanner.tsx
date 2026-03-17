"use client";

import { Shield, Wifi, WifiOff, Lock, Eye } from "lucide-react";
import { PrivacyStats } from "@/utils/types";
import { formatFileSize } from "@/utils/fileUtils";

interface Props {
  stats: PrivacyStats;
  offlineMode: boolean;
  onToggleOffline: () => void;
  sessionDuration: () => string;
}

export function PrivacyBanner({
  stats,
  offlineMode,
  onToggleOffline,
  sessionDuration,
}: Props) {
  return (
    <div className="sticky top-0 z-50 border-b border-ink-600 bg-ink-900/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          
          {/* Privacy Mode Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-safe/10 border border-safe/30 rounded-full px-3 py-1 animated-border">
              <div className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
              <Shield className="w-3.5 h-3.5 text-safe" />
              <span className="text-safe font-mono text-xs font-semibold tracking-wider uppercase">
                Privacy Mode: ON
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-4 flex-wrap">
            
            {/* Bytes Uploaded — always 0 */}
            <Stat
              icon={<Lock className="w-3 h-3" />}
              label="Uploaded"
              value={formatFileSize(stats.bytesUploaded)}
              highlight={stats.bytesUploaded === 0}
            />

            {/* Files processed */}
            <Stat
              icon={<Eye className="w-3 h-3" />}
              label="Processed locally"
              value={String(stats.filesProcessedLocally)}
            />

            {/* Privacy guarantee */}
            <div className="hidden sm:flex items-center gap-1.5 text-ghost-300">
              <div className="w-px h-4 bg-ink-600" />
              <span className="font-mono text-xs">
                Your file never leaves your device
              </span>
            </div>
          </div>

          {/* Offline Toggle */}
          <button
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono transition-all ${
              offlineMode
                ? "bg-neon-blue/10 border-neon-blue/40 text-neon-blue"
                : "border-ink-600 text-ghost-400 hover:border-ghost-300 hover:text-ghost-200"
            }`}
          >
            {offlineMode ? (
              <WifiOff className="w-3 h-3" />
            ) : (
              <Wifi className="w-3 h-3" />
            )}
            {offlineMode ? "Offline Mode" : "Online"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={highlight ? "text-safe" : "text-ghost-400"}>{icon}</span>
      <span className="text-ghost-400 font-mono text-xs">{label}:</span>
      <span
        className={`font-mono text-xs font-semibold ${
          highlight ? "text-safe" : "text-ghost-100"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
