/**
 * Audio processing — fully client-side using Web Audio API.
 * For MVP: extracts metadata and waveform info locally.
 * Structure is ready for future integration with whisper.wasm or similar.
 */

export interface AudioMetadata {
  duration: number;       // seconds
  sampleRate: number;
  channels: number;
  fileName: string;
  fileSize: number;
  format: string;
}

export async function processAudioFile(
  file: File,
  onProgress?: (pct: number) => void
): Promise<{ metadata: AudioMetadata; text: string }> {
  onProgress?.(10);

  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(30);

  // Use Web Audio API to decode — fully local
  const AudioContextClass =
    window.AudioContext || (window as any).webkitAudioContext;

  let metadata: AudioMetadata = {
    duration: 0,
    sampleRate: 44100,
    channels: 1,
    fileName: file.name,
    fileSize: file.size,
    format: file.type,
  };

  try {
    const audioContext = new AudioContextClass();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    onProgress?.(80);

    metadata = {
      ...metadata,
      duration: audioBuffer.duration,
      sampleRate: audioBuffer.sampleRate,
      channels: audioBuffer.numberOfChannels,
    };

    audioContext.close();
  } catch {
    // Some formats may not be supported by Web Audio — still return basic info
  }

  onProgress?.(100);

  // Format a human-readable summary (transcription would go here with whisper.wasm)
  const text = formatAudioSummary(metadata);

  return { metadata, text };
}

function formatAudioSummary(meta: AudioMetadata): string {
  const mins = Math.floor(meta.duration / 60);
  const secs = Math.round(meta.duration % 60);
  const duration = meta.duration > 0 ? `${mins}m ${secs}s` : "unknown";

  return [
    `[Audio File Analysis]`,
    ``,
    `File: ${meta.fileName}`,
    `Format: ${meta.format || "unknown"}`,
    `Duration: ${duration}`,
    `Sample Rate: ${meta.sampleRate.toLocaleString()} Hz`,
    `Channels: ${meta.channels === 1 ? "Mono" : meta.channels === 2 ? "Stereo" : meta.channels}`,
    ``,
    `[Transcription]`,
    `Audio transcription requires a local speech model (e.g., whisper.wasm).`,
    `This feature is scaffolded for future integration — the audio has been`,
    `analyzed locally without any data leaving your device.`,
  ].join("\n");
}
