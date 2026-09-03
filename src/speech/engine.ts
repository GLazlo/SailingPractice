export interface SpeechEngine {
  init(onProgress?: (pct: number) => void): Promise<void>;
  /** The grammar limits what the recognizer may return, per practice mode. */
  start(grammar: string[]): Promise<void>;
  stop(): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  /** The live microphone stream, for callers that also want to record it. */
  getStream(): MediaStream | null;
  /** Raw recognized text; each page applies its own tokenization. */
  onFinalText(cb: (text: string) => void): void;
  onPartial(cb: (text: string) => void): void;
  onError(cb: (err: Error) => void): void;
}
