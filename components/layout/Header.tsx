"use client";

import { Cpu, Github } from "lucide-react";

export function Header() {
  return (
    <header className="max-w-7xl mx-auto px-4 pt-8 pb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-safe/10 border border-safe/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-safe" />
            </div>
            <span className="font-display text-xl font-bold tracking-tight text-ghost-100">
              Local<span className="text-safe">AI</span>
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ghost-100 leading-tight">
            Process files.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-safe to-neon-blue">
              Privately. Locally.
            </span>
          </h1>
          <p className="text-ghost-400 mt-2 text-sm max-w-sm leading-relaxed">
            AI-powered file processing that runs entirely in your browser.
            Your data never touches a server.
          </p>
        </div>

        {/* Tech badges */}
        <div className="hidden sm:flex flex-col items-end gap-2 mt-1">
          {[
            "pdf.js",
            "Tesseract.js",
            "Web Audio API",
            "100% Client-Side",
          ].map((tech) => (
            <span
              key={tech}
              className="text-ghost-400 font-mono text-xs border border-ink-600 rounded-full px-2.5 py-0.5"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
}
