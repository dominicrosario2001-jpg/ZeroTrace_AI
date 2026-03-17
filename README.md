# LocalAI — Privacy-First File Processor

> Process PDFs, images, and audio files with AI — entirely in your browser.  
> **0 bytes uploaded. Your files never leave your device.**

---

## 📁 Folder Structure

```
privacy-ai-app/
├── app/
│   ├── layout.tsx          # Root layout, fonts, metadata
│   ├── page.tsx            # Main page — assembles all components
│   └── globals.css         # Tailwind + custom styles
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx          # App title + tech badges
│   │   └── PrivacyBanner.tsx   # Sticky "Privacy Mode: ON" banner
│   └── processing/
│       ├── DropZone.tsx        # Drag-and-drop file upload
│       ├── FileCard.tsx        # Per-file result card (preview, text, summary)
│       ├── LogPanel.tsx        # Live terminal-style log viewer
│       └── StatsBar.tsx        # Batch stats + Download ZIP button
│
├── hooks/
│   ├── useLogger.ts            # Centralized logging hook
│   ├── useFileProcessor.ts     # Processing pipeline orchestrator
│   └── usePrivacyStats.ts      # Privacy metrics tracker
│
├── utils/
│   ├── types.ts                # Shared TypeScript types
│   ├── fileUtils.ts            # File helpers (size, type, read)
│   ├── pdfProcessor.ts         # PDF text extraction via pdf.js
│   ├── ocrProcessor.ts         # Image OCR via Tesseract.js
│   ├── audioProcessor.ts       # Audio analysis via Web Audio API
│   ├── aiAnalysis.ts           # Local document type detection + summarization
│   └── downloadUtils.ts        # Client-side file/ZIP downloads
│
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🚀 Setup Instructions

### 1. Prerequisites
- Node.js 18+ 
- npm or yarn

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Build for production
```bash
npm run build
npm start
```

---

## 🔧 Key Dependencies

| Package | Purpose | Privacy Note |
|---|---|---|
| `pdfjs-dist` | PDF text extraction | Runs in browser Web Worker |
| `tesseract.js` | Image OCR | Runs in browser Web Worker |
| `jszip` | Client-side ZIP generation | Pure JS, no server |
| `lucide-react` | Icons | Static assets |

---

## 🏗 Architecture Notes

### Privacy Guarantees
- **FileReader API** reads files into memory — no fetch/XHR with file data
- **pdf.js** uses its own Web Worker for PDF decoding
- **Tesseract.js** downloads its WASM + training data once (browser cache), then runs offline
- **Web Audio API** decodes audio entirely in-memory
- **PerformanceObserver** monitors for unexpected network transfers (debug mode)
- All downloads use `Blob` + `URL.createObjectURL` — no server round-trip

### Adding a Local LLM (Future)
Replace the mock functions in `utils/aiAnalysis.ts` with:
```ts
// Example: WebLLM integration
import { CreateMLCEngine } from "@mlc-ai/web-llm";
const engine = await CreateMLCEngine("Llama-3.2-1B-Instruct-q4f32_1-MLC");
const reply = await engine.chat.completions.create({ messages: [...] });
```
The `generateSummary` and `detectDocumentType` function signatures are unchanged.

### Performance
- Heavy processing (OCR, PDF) runs in Web Workers — UI stays responsive
- Files up to 100MB are accepted; >50MB shows a warning
- Batch upload supported — files are queued and processed sequentially

---

## 📸 Features

- **Drag & drop** multi-file upload with type validation
- **PDF** → text extraction (all pages, with progress)
- **Images** → OCR text recognition (Tesseract.js)
- **Audio** → metadata analysis (Web Audio API)
- **Document type detection**: resume, invoice, contract, article, generic
- **Local summarization**: extractive, keyword-weighted
- **Structured output**: key fields extracted per document type
- **Live log panel**: terminal-style real-time processing feed
- **Download**: extracted text, structured JSON, or ZIP of all outputs
- **Offline toggle**: UI-ready for service worker integration
- **Privacy banner**: persistent "0 bytes uploaded" counter
