export interface SpeechEngine {
  init(onProgress?: (pct: number) => void): Promise<void>;
  start(): Promise<void>;
  stop(): Promise<void>;
  onFinalTokens(cb: (tokens: string[]) => void): void;
  onPartial(cb: (text: string) => void): void;
  onError(cb: (err: Error) => void): void;
}
